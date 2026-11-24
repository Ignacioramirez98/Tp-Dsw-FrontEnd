import { Cliente } from './cliente.model';
import { Operario } from './operario.model';
import { Servicio } from './servicio.model';

/** Estados de una solicitud de servicio (ver backend: solicitud-servicio.estados.ts). */
export type EstadoSolicitud = 'pendiente' | 'aceptada' | 'finalizada' | 'cancelada';
export const ESTADOS_SOLICITUD: EstadoSolicitud[] = ['pendiente', 'aceptada', 'finalizada', 'cancelada'];

/** Solicitud tal como la devuelve la API (con cliente, servicio y operario cargados). */
export interface SolicitudServicio {
  _id: string;
  estado: EstadoSolicitud | string;
  fechaSolicitud: string | Date;
  fechaPreferida?: string | Date | null;
  fechaAceptacion?: string | Date | null;
  fechaFinalizacion?: string | Date | null;
  fechaCancelacion?: string | Date | null;
  horasEstimadas: number;
  horasReales?: number | null;
  /** Precio por hora del servicio al momento del pedido. */
  importePorHora: number;
  importeEstimado: number;
  importeFinal?: number | null;
  observaciones?: string | null;
  motivoCancelacion?: string | null;
  cliente?: Cliente;
  servicio?: Servicio;
  operario?: Operario | null;
}

/** Datos que carga el cliente al pedir un servicio. */
export interface SolicitudPayload {
  servicioId: string;
  horasEstimadas: number;
  /** AAAA-MM-DD */
  fechaPreferida?: string | null;
  observaciones?: string | null;
}

export interface FiltrosSolicitud {
  estado?: string;
  /** AAAA-MM-DD */
  desde?: string;
  hasta?: string;
}
