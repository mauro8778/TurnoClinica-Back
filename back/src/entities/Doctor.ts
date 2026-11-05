import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Specialty } from "./Specialty";
import { Appointment } from "./Appointment";

@Entity({ name: "doctors" })
export class Doctor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  name: string;

  @Column({ unique: true })
  licenseNumber: string; // Matrícula médica

  @Column({ unique: true })
  email: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Specialty, (specialty) => specialty.doctors, { eager: true, nullable: true })
  specialty: Specialty;

  @OneToMany(() => Appointment, (appointment) => appointment.doctor)
  appointments: Appointment[];
}
