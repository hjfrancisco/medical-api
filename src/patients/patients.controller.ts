// src/patients/patients.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Patch, // <-- Asegúrate de que Patch esté importado
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { JwtAuthGuard } from '../auth/guard/jwt.guard'; // 1. IMPORTAMOS NUESTRO GUARDIA


// 2. APLICAMOS EL GUARDIA A NIVEL DE CONTROLADOR
// Esto significa que CADA endpoint definido en esta clase estará protegido.
// Nadie podrá acceder a ellos sin un token JWT válido.
@UseGuards(JwtAuthGuard)
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  // POST /patients
  @Post()
  create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientsService.create(createPatientDto);
  }

  // GET /patients
  @Get()
  findAll(@Request() req, @Query('search') searchTerm?: string) {
    const user = req.user; // Obtenemos el usuario del token
    return this.patientsService.findAll(user, searchTerm); // Le pasamos el usuario al servicio
  }

  // GET /patients/:id
// Asegúrate de que Get esté en la lista de importación de @nestjs/common

@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
  return this.patientsService.findOne(id);
}

@Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePatientDto: UpdatePatientDto,
  ) {
    return this.patientsService.update(id, updatePatientDto);
  }

}