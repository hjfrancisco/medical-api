// src/study-types/study-types.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { StudyTypesService } from './study-types.service';
import { CreateStudyTypeDto } from './dto/create-study-type.dto';
import { UpdateStudyTypeDto } from './dto/update-study-type.dto';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';

@UseGuards(JwtAuthGuard) // Protegemos todos los endpoints
@Controller('study-types')
export class StudyTypesController {
  constructor(private readonly studyTypesService: StudyTypesService) {}

  @Post()
  create(@Body() createStudyTypeDto: CreateStudyTypeDto) {
    return this.studyTypesService.create(createStudyTypeDto);
  }

  @Get('check-similar')
  findSimilar(@Query('name') name: string) {
    return this.studyTypesService.findSimilar(name);
  }

  @Get()
  findAll() {
    return this.studyTypesService.findAll();
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateStudyTypeDto: UpdateStudyTypeDto) {
    return this.studyTypesService.update(id, updateStudyTypeDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studyTypesService.remove(id);
  }
}