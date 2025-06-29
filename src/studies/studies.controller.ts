// src/studies/studies.controller.ts
import { Controller, Post, Body, UseGuards, Get, Param, ParseIntPipe, NotFoundException, Request } from '@nestjs/common';
import { StudiesService} from './studies.service';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { Patch, Query } from '@nestjs/common';

@UseGuards(JwtAuthGuard)
@Controller('studies')
export class StudiesController {
  constructor(private readonly studiesService: StudiesService) {}


// En src/studies/studies.controller.ts
@Post('generate-upload-url')
generateUploadUrl(@Body() body: { 
  patientId: number, 
  studyTypeId: number,
  requestingDoctorId: number,
  studyDate: Date,
  fileName: string, 
  contentType: string 
}) {
  return this.studiesService.generateUploadUrl(body);
}


@Patch(':id/upload-report-url')
generateReportUploadUrl(
  @Param('id', ParseIntPipe) id: number,
  @Body() body: { fileName: string; contentType: string },
) {
  return this.studiesService.generateReportUploadUrl(
    id,
    body.fileName,
    body.contentType,
  );
}  


@Get('patient/:patientId')
findAllForPatient(
  @Param('patientId', ParseIntPipe) patientId: number,
  @Query('doctorId') doctorId?: string, // Query param opcional
) {
  // Convertimos el doctorId a número si existe
  const doctorIdNum = doctorId ? parseInt(doctorId, 10) : undefined;
  return this.studiesService.findAllForPatient(patientId, doctorIdNum);
}

@Get(':id/download-url')
getDownloadUrl(
  @Param('id', ParseIntPipe) id: number,
  @Query('fileType') fileType: 'studyFileKey' | 'reportFileKey',
  @Query('disposition') disposition?: 'inline' | 'attachment', // Nuevo query param opcional
) {
  return this.studiesService.getDownloadUrl(id, fileType, disposition);
}

  @UseGuards(JwtAuthGuard)
  @Get('me/my-studies')
  findMyStudies(@Request() req) {
  // El guard JwtAuthGuard añade el objeto 'user' (con id y role) a la request.
  const userId = req.user.id;
  return this.studiesService.findMyStudies(userId);
  }

}