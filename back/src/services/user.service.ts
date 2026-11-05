import { userModel } from "../config/data-source";
import { getCache, setCache } from "../config/redis";
import { User } from "../entities";

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getAllUsersService = async (
  page: number = 1,
  limit: number = 20
): Promise<PaginationResult<User>> => {
  const cacheKey = `users:page:${page}:limit:${limit}`;
  const cached = await getCache<PaginationResult<User>>(cacheKey);
  if (cached) {
    return cached;
  }

  const skip = (page - 1) * limit;

  const [data, total] = await userModel.findAndCount({
    relations: {
      appointments: true,
      credential: true,
    },
    skip,
    take: limit,
    order: { id: "DESC" },
  });

  const result: PaginationResult<User> = {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  await setCache(cacheKey, result, 60); // 1 minuto de caché

  return result;
};

export const getUserByIdService = async (id: number): Promise<User> => {
  const cacheKey = `user:${id}`;
  const cached = await getCache<User>(cacheKey);
  if (cached) {
    return cached;
  }

  const user = await userModel.findOne({
    where: { id },
    relations: ["credential", "appointments", "triageAssessments"],
  });

  if (!user) {
    const err: any = new Error(`Usuario con ID ${id} no encontrado`);
    err.statusCode = 404;
    throw err;
  }

  await setCache(cacheKey, user, 120);

  return user;
};
