import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource, credentialModel, userModel } from "../config/data-source";
import { envs } from "../config/envs";
import { RegisterDto, LoginDto } from "../dtos/auth.dto";
import { Credential, User } from "../entities";
import { addEmailJob } from "./queue.service";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface AuthResponse {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    nDni: string;
  };
  tokens: AuthTokens;
}

export const registerUserService = async (data: RegisterDto): Promise<AuthResponse> => {
  return await AppDataSource.transaction(async (transactionalEntityManager) => {
    // 1. Validar que no existan duplicados (email, DNI, username)
    const existingUser = await transactionalEntityManager.findOne(User, {
      where: [{ email: data.email }, { nDni: data.nDni }],
    });

    if (existingUser) {
      if (existingUser.email === data.email) {
        const err: any = new Error("El correo electrónico ya se encuentra registrado");
        err.statusCode = 409;
        throw err;
      }
      if (existingUser.nDni === data.nDni) {
        const err: any = new Error("El DNI ya se encuentra registrado");
        err.statusCode = 409;
        throw err;
      }
    }

    const existingCredential = await transactionalEntityManager.findOne(Credential, {
      where: { username: data.username },
    });

    if (existingCredential) {
      const err: any = new Error("El nombre de usuario ya está en uso");
      err.statusCode = 409;
      throw err;
    }

    // 2. Hashear la contraseña con salt seguro (12 rondas)
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // 3. Crear y guardar la credencial
    const credential = transactionalEntityManager.create(Credential, {
      username: data.username,
      password: hashedPassword,
    });
    await transactionalEntityManager.save(credential);

    // 4. Crear y guardar el usuario
    const newUser = transactionalEntityManager.create(User, {
      name: data.name,
      email: data.email,
      birthdate: data.birthdate,
      nDni: data.nDni,
      phone: data.phone,
      role: data.role || "patient",
      credential,
    });
    await transactionalEntityManager.save(newUser);

    // 5. Emitir tokens JWT
    const tokens = generateTokens(newUser);

    // 6. Encolar correo de bienvenida en segundo plano (Asíncrono con BullMQ)
    await addEmailJob({
      type: "WELCOME",
      to: newUser.email,
      name: newUser.name,
      payload: {},
    });

    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        nDni: newUser.nDni,
      },
      tokens,
    };
  });
};

export const loginUserService = async (data: LoginDto): Promise<AuthResponse> => {
  // Buscar la credencial con el campo password explícito (ya que tiene select: false)
  const credential = await credentialModel
    .createQueryBuilder("cred")
    .addSelect("cred.password")
    .where("cred.username = :username", { username: data.username })
    .getOne();

  if (!credential) {
    const err: any = new Error("Credenciales inválidas");
    err.statusCode = 401;
    throw err;
  }

  // Comparar contraseña hasheada
  const isMatch = await bcrypt.compare(data.password, credential.password);
  if (!isMatch) {
    const err: any = new Error("Credenciales inválidas");
    err.statusCode = 401;
    throw err;
  }

  // Buscar el usuario asociado mediante relación segura
  const user = await userModel.findOne({
    where: { credential: { id: credential.id } },
  });

  if (!user) {
    const err: any = new Error("Usuario no encontrado");
    err.statusCode = 404;
    throw err;
  }

  const tokens = generateTokens(user);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      nDni: user.nDni,
    },
    tokens,
  };
};

function generateTokens(user: User): AuthTokens {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, envs.JWT_SECRET as string, {
    expiresIn: envs.JWT_EXPIRES_IN as any,
  });

  const refreshToken = jwt.sign({ id: user.id }, envs.JWT_REFRESH_SECRET as string, {
    expiresIn: envs.JWT_REFRESH_EXPIRES_IN as any,
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: envs.JWT_EXPIRES_IN,
  };
}
