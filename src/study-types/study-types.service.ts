// src/study-types/study-types.service.ts
import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudyTypeDto } from './dto/create-study-type.dto';
import { UpdateStudyTypeDto } from './dto/update-study-type.dto';
const unidecode = require('unidecode');

@Injectable()
export class StudyTypesService {
  constructor(private prisma: PrismaService) {}

    // Función auxiliar para "normalizar" un texto: lo pasa a minúsculas y le quita los acentos.
  private normalizeString(text: string): string {
    return unidecode(text).toLowerCase();
  }

 async create(createStudyTypeDto: CreateStudyTypeDto) {
    // 2. NORMALIZAMOS EL NUEVO NOMBRE QUE QUIERE CREAR EL USUARIO
    const normalizedNewName = this.normalizeString(createStudyTypeDto.name);

    // 3. BUSCAMOS TODOS LOS TIPOS DE ESTUDIO EXISTENTES
    const existingStudyTypes = await this.prisma.studyType.findMany();

    // 4. BUSCAMOS SI HAY ALGUNA COINCIDENCIA "INTELIGENTE"
    const similarExists = existingStudyTypes.find(
      (st) => this.normalizeString(st.name) === normalizedNewName
    );

    // 5. SI ENCONTRAMOS UNA COINCIDENCIA, LANZAMOS UN ERROR
    if (similarExists) {
      throw new ConflictException(
        `Ya existe un tipo de estudio con un nombre similar: "${similarExists.name}"`
      );
    }

    // Si pasamos todas las validaciones, creamos el nuevo tipo de estudio.
    return this.prisma.studyType.create({ data: createStudyTypeDto });
  }

  // --- MÉTODO PARA BUSCAR SIMILITUDES ---
  async findSimilar(name: string) {
    // Si el nombre a buscar está vacío, no devolvemos nada.
    if (!name || name.trim() === '') {
      return [];
    }
    const normalizedName = this.normalizeString(name);
    const allStudyTypes = await this.prisma.studyType.findMany();

    // Filtramos la lista para encontrar coincidencias parciales e insensibles a mayúsculas/acentos
    const similar = allStudyTypes.filter((st) =>
      this.normalizeString(st.name).includes(normalizedName),
    );
    return similar;
  }

  findAll() {
    return this.prisma.studyType.findMany({
      orderBy: { name: 'asc' },
    });
  }

  update(id: number, updateStudyTypeDto: UpdateStudyTypeDto) {
    return this.prisma.studyType.update({
      where: { id },
      data: updateStudyTypeDto,
    });
  }

  async remove(id: number) {
    try {
      return await this.prisma.studyType.delete({ where: { id } });
    } catch (error) {
      // Si el tipo de estudio está en uso por algún estudio, la base de datos dará un error.
      // Lo capturamos y devolvemos un error más amigable.
      throw new ConflictException('No se puede eliminar. Este tipo de estudio ya está en uso.');
    }
  }
}