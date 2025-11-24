import type { POA, Actividad, POAType } from '../models/POA';
import type { Area } from '../models/Area';
import type { Carrera } from '../models/Carrera';
import type { Facultad } from '../models/Facultad';

export class POAViewModel {
  private poas: POA[] = [];
  private areas: Area[] = [];
  private carreras: Carrera[] = [];
  private facultades: Facultad[] = [];
  private listeners: Array<() => void> = [];

  constructor() {
    // Initialize with example areas
    this.areas = [
      { id: '1', nombre: 'Área Académica', descripcion: 'Gestión académica' },
      { id: '2', nombre: 'Área Administrativa', descripcion: 'Gestión administrativa' },
      { id: '3', nombre: 'Área de Investigación', descripcion: 'Gestión de investigación' },
      { id: '4', nombre: 'Área de Extensión', descripcion: 'Gestión de extensión universitaria' },
    ];

    // Initialize with example facultades
    this.facultades = [
      { id: '1', nombre: 'Facultad de Ingeniería', descripcion: 'Facultad de Ingeniería' },
      { id: '2', nombre: 'Facultad de Ciencias Económicas', descripcion: 'Facultad de Ciencias Económicas' },
      { id: '3', nombre: 'Facultad de Ciencias Sociales', descripcion: 'Facultad de Ciencias Sociales' },
      { id: '4', nombre: 'Facultad de Derecho', descripcion: 'Facultad de Derecho' },
      { id: '5', nombre: 'Facultad de Ciencias de la Salud', descripcion: 'Facultad de Ciencias de la Salud' },
    ];

    // Initialize with example carreras
    this.carreras = [
      { id: '1', nombre: 'Ingeniería de Sistemas', descripcion: 'Carrera de Ingeniería de Sistemas', facultad: 'Facultad de Ingeniería' },
      { id: '2', nombre: 'Administración de Empresas', descripcion: 'Carrera de Administración', facultad: 'Facultad de Ciencias Económicas' },
      { id: '3', nombre: 'Psicología', descripcion: 'Carrera de Psicología', facultad: 'Facultad de Ciencias Sociales' },
      { id: '4', nombre: 'Derecho', descripcion: 'Carrera de Derecho', facultad: 'Facultad de Derecho' },
    ];
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    listener();
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  getAreas(): Area[] {
    return [...this.areas];
  }

  getCarreras(): Carrera[] {
    return [...this.carreras];
  }

  getPOAs(): POA[] {
    return [...this.poas];
  }

  createPOA(poa: Omit<POA, 'id' | 'actividades'>): POA {
    const newPOA: POA = {
      ...poa,
      id: Date.now().toString(),
      actividades: [],
    };
    this.poas.push(newPOA);
    this.notify();
    return newPOA;
  }

  addActividadToPOA(poaId: string, actividad: Omit<Actividad, 'id'>): Actividad {
    const poa = this.poas.find(p => p.id === poaId);
    if (!poa) {
      throw new Error('POA not found');
    }

    const newActividad: Actividad = {
      ...actividad,
      id: Date.now().toString(),
    };
    poa.actividades.push(newActividad);
    this.notify();
    return newActividad;
  }

  updateActividad(poaId: string, actividadId: string, actividad: Partial<Actividad>): void {
    const poa = this.poas.find(p => p.id === poaId);
    if (!poa) {
      throw new Error('POA not found');
    }

    const actividadIndex = poa.actividades.findIndex(a => a.id === actividadId);
    if (actividadIndex === -1) {
      throw new Error('Actividad not found');
    }

    poa.actividades[actividadIndex] = {
      ...poa.actividades[actividadIndex],
      ...actividad,
    };
    this.notify();
  }

  deleteActividad(poaId: string, actividadId: string): void {
    const poa = this.poas.find(p => p.id === poaId);
    if (!poa) {
      throw new Error('POA not found');
    }

    poa.actividades = poa.actividades.filter(a => a.id !== actividadId);
    this.notify();
  }

  getPOA(poaId: string): POA | undefined {
    return this.poas.find(p => p.id === poaId);
  }

  updatePOA(poaId: string, poaData: Partial<Omit<POA, 'id' | 'actividades'>>): void {
    const poa = this.poas.find(p => p.id === poaId);
    if (!poa) {
      throw new Error('POA not found');
    }

    Object.assign(poa, poaData);
    this.notify();
  }

  // Area management methods
  createArea(area: Omit<Area, 'id'>): Area {
    const newArea: Area = {
      ...area,
      id: Date.now().toString(),
    };
    this.areas.push(newArea);
    this.notify();
    return newArea;
  }

  updateArea(areaId: string, areaData: Partial<Omit<Area, 'id'>>): void {
    const area = this.areas.find(a => a.id === areaId);
    if (!area) {
      throw new Error('Area not found');
    }

    Object.assign(area, areaData);
    this.notify();
  }

  deleteArea(areaId: string): void {
    const areaIndex = this.areas.findIndex(a => a.id === areaId);
    if (areaIndex === -1) {
      throw new Error('Area not found');
    }

    this.areas.splice(areaIndex, 1);
    this.notify();
  }

  getArea(areaId: string): Area | undefined {
    return this.areas.find(a => a.id === areaId);
  }

  // Carrera management methods
  createCarrera(carrera: Omit<Carrera, 'id'>): Carrera {
    const newCarrera: Carrera = {
      ...carrera,
      id: Date.now().toString(),
    };
    this.carreras.push(newCarrera);
    this.notify();
    return newCarrera;
  }

  updateCarrera(carreraId: string, carreraData: Partial<Omit<Carrera, 'id'>>): void {
    const carrera = this.carreras.find(c => c.id === carreraId);
    if (!carrera) {
      throw new Error('Carrera not found');
    }

    Object.assign(carrera, carreraData);
    this.notify();
  }

  deleteCarrera(carreraId: string): void {
    const carreraIndex = this.carreras.findIndex(c => c.id === carreraId);
    if (carreraIndex === -1) {
      throw new Error('Carrera not found');
    }

    this.carreras.splice(carreraIndex, 1);
    this.notify();
  }

  getCarrera(carreraId: string): Carrera | undefined {
    return this.carreras.find(c => c.id === carreraId);
  }

  // Facultad management methods
  getFacultades(): Facultad[] {
    return [...this.facultades];
  }

  createFacultad(facultad: Omit<Facultad, 'id'>): Facultad {
    const newFacultad: Facultad = {
      ...facultad,
      id: Date.now().toString(),
    };
    this.facultades.push(newFacultad);
    this.notify();
    return newFacultad;
  }

  updateFacultad(facultadId: string, facultadData: Partial<Omit<Facultad, 'id'>>): void {
    const facultad = this.facultades.find(f => f.id === facultadId);
    if (!facultad) {
      throw new Error('Facultad not found');
    }

    Object.assign(facultad, facultadData);
    this.notify();
  }

  deleteFacultad(facultadId: string): void {
    // Check if any carrera is using this facultad
    const carrerasUsingFacultad = this.carreras.some(c => {
      const facultad = this.facultades.find(f => f.id === facultadId);
      return facultad && c.facultad === facultad.nombre;
    });

    if (carrerasUsingFacultad) {
      throw new Error('No se puede eliminar la facultad porque está siendo utilizada por una o más carreras');
    }

    const facultadIndex = this.facultades.findIndex(f => f.id === facultadId);
    if (facultadIndex === -1) {
      throw new Error('Facultad not found');
    }

    this.facultades.splice(facultadIndex, 1);
    this.notify();
  }

  getFacultad(facultadId: string): Facultad | undefined {
    return this.facultades.find(f => f.id === facultadId);
  }
}

export const poaViewModel = new POAViewModel();

