import type { POA, Actividad, POAType } from '../models/POA';
import type { Area } from '../models/Area';
import type { Carrera } from '../models/Carrera';
import type { Facultad } from '../models/Facultad';
import { poaService } from '../services/poaService';
import { areaService } from '../services/areaService';
import { carreraService } from '../services/carreraService';
import { facultadService } from '../services/facultadService';
import { normalizeArray, normalizeId, extractId } from '../utils/modelHelpers';

export class POAViewModel {
  private poas: POA[] = [];
  private areas: Area[] = [];
  private carreras: Carrera[] = [];
  private facultades: Facultad[] = [];
  private listeners: Array<() => void> = [];

  constructor() {
    // Load data from API
    this.loadAreas();
    this.loadFacultades();
    this.loadCarreras();
    this.loadPOAs();
  }

  private async loadAreas() {
    try {
      const areas = await areaService.getAll();
      this.areas = normalizeArray(areas);
      this.notify();
    } catch (error) {
      console.error('Error loading areas:', error);
    }
  }

  private async loadFacultades() {
    try {
      const facultades = await facultadService.getAll();
      this.facultades = normalizeArray(facultades);
      this.notify();
    } catch (error) {
      console.error('Error loading facultades:', error);
    }
  }

  private async loadCarreras() {
    try {
      const carreras = await carreraService.getAll();
      this.carreras = normalizeArray(carreras);
      this.notify();
    } catch (error) {
      console.error('Error loading carreras:', error);
    }
  }

  private async loadPOAs() {
    try {
      const poas = await poaService.getAll();
      this.poas = normalizeArray(poas);
      this.notify();
    } catch (error) {
      console.error('Error loading POAs:', error);
    }
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

  async createPOA(poa: Omit<POA, 'id' | '_id' | 'actividades'> & { actividades?: Omit<Actividad, 'id' | '_id'>[] }): Promise<POA> {
    try {
      const newPOA = await poaService.create(poa);
      const normalized = normalizeId(newPOA);
      // Normalize actividades
      if (normalized.actividades) {
        normalized.actividades = normalized.actividades.map(a => normalizeId(a));
      }
      this.poas.push(normalized);
      this.notify();
      return normalized;
    } catch (error) {
      throw error;
    }
  }

  async addActividadToPOA(poaId: string, actividad: Omit<Actividad, 'id' | '_id'>): Promise<Actividad> {
    try {
      const updatedPOA = await poaService.addActividad(poaId, actividad);
      const normalized = normalizeId(updatedPOA);
      if (normalized.actividades) {
        normalized.actividades = normalized.actividades.map(a => normalizeId(a));
      }
      const index = this.poas.findIndex(p => extractId(p) === poaId);
      if (index !== -1) {
        this.poas[index] = normalized;
        this.notify();
      }
      // Return the last actividad (the one we just added)
      const newActividad = normalized.actividades[normalized.actividades.length - 1];
      return newActividad;
    } catch (error) {
      throw error;
    }
  }

  async updateActividad(poaId: string, actividadId: string, actividad: Partial<Actividad>): Promise<void> {
    try {
      const updatedPOA = await poaService.updateActividad(poaId, actividadId, actividad);
      const normalized = normalizeId(updatedPOA);
      if (normalized.actividades) {
        normalized.actividades = normalized.actividades.map(a => normalizeId(a));
      }
      const index = this.poas.findIndex(p => extractId(p) === poaId);
      if (index !== -1) {
        this.poas[index] = normalized;
        this.notify();
      }
    } catch (error) {
      throw error;
    }
  }

  async deleteActividad(poaId: string, actividadId: string): Promise<void> {
    try {
      await poaService.deleteActividad(poaId, actividadId);
      const poa = this.poas.find(p => extractId(p) === poaId);
      if (poa) {
        poa.actividades = poa.actividades.filter(a => extractId(a) !== actividadId);
        this.notify();
      }
    } catch (error) {
      throw error;
    }
  }

  getPOA(poaId: string): POA | undefined {
    return this.poas.find(p => extractId(p) === poaId);
  }

  async updatePOA(poaId: string, poaData: Partial<Omit<POA, 'id' | '_id' | 'actividades'>>): Promise<void> {
    try {
      const updatedPOA = await poaService.update(poaId, poaData);
      const normalized = normalizeId(updatedPOA);
      if (normalized.actividades) {
        normalized.actividades = normalized.actividades.map(a => normalizeId(a));
      }
      const index = this.poas.findIndex(p => extractId(p) === poaId);
      if (index !== -1) {
        this.poas[index] = normalized;
        this.notify();
      }
    } catch (error) {
      throw error;
    }
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
  async createCarrera(carrera: Omit<Carrera, 'id' | '_id'>): Promise<Carrera> {
    try {
      const newCarrera = await carreraService.create(carrera);
      const normalized = normalizeId(newCarrera);
      this.carreras.push(normalized);
      this.notify();
      return normalized;
    } catch (error) {
      throw error;
    }
  }

  async updateCarrera(carreraId: string, carreraData: Partial<Omit<Carrera, 'id' | '_id'>>): Promise<void> {
    try {
      const updatedCarrera = await carreraService.update(carreraId, carreraData);
      const normalized = normalizeId(updatedCarrera);
      const index = this.carreras.findIndex(c => extractId(c) === carreraId);
      if (index !== -1) {
        this.carreras[index] = normalized;
        this.notify();
      }
    } catch (error) {
      throw error;
    }
  }

  async deleteCarrera(carreraId: string): Promise<void> {
    try {
      await carreraService.delete(carreraId);
      this.carreras = this.carreras.filter(c => extractId(c) !== carreraId);
      this.notify();
    } catch (error) {
      throw error;
    }
  }

  getCarrera(carreraId: string): Carrera | undefined {
    return this.carreras.find(c => extractId(c) === carreraId);
  }

  // Facultad management methods
  getFacultades(): Facultad[] {
    return [...this.facultades];
  }

  async createFacultad(facultad: Omit<Facultad, 'id' | '_id'>): Promise<Facultad> {
    try {
      const newFacultad = await facultadService.create(facultad);
      const normalized = normalizeId(newFacultad);
      this.facultades.push(normalized);
      this.notify();
      return normalized;
    } catch (error) {
      throw error;
    }
  }

  async updateFacultad(facultadId: string, facultadData: Partial<Omit<Facultad, 'id' | '_id'>>): Promise<void> {
    try {
      const updatedFacultad = await facultadService.update(facultadId, facultadData);
      const normalized = normalizeId(updatedFacultad);
      const index = this.facultades.findIndex(f => extractId(f) === facultadId);
      if (index !== -1) {
        this.facultades[index] = normalized;
        this.notify();
      }
    } catch (error) {
      throw error;
    }
  }

  async deleteFacultad(facultadId: string): Promise<void> {
    try {
      await facultadService.delete(facultadId);
      this.facultades = this.facultades.filter(f => extractId(f) !== facultadId);
      this.notify();
    } catch (error) {
      throw error;
    }
  }

  getFacultad(facultadId: string): Facultad | undefined {
    return this.facultades.find(f => extractId(f) === facultadId);
  }
}

export const poaViewModel = new POAViewModel();

