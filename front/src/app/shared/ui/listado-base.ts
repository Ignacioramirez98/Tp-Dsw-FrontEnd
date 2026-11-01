import { Directive, OnInit, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfirmacionService } from './confirmacion.service';
import { NotificacionService } from './notificacion.service';

/**
 * Comportamiento común de las pantallas de listado (patrón Template Method):
 * cargar, buscar por texto, paginar y eliminar con confirmación.
 * Cada listado concreto solo define cómo cargar, cómo eliminar y qué texto buscar.
 */
@Directive()
export abstract class ListadoBase<T extends { _id: string }> implements OnInit {
  protected readonly confirmacion = inject(ConfirmacionService);
  protected readonly notificaciones = inject(NotificacionService);

  items: T[] = [];
  visibles: T[] = [];
  cargando = true;
  error = '';
  busqueda = '';
  pagina = 1;
  readonly porPagina = 10;
  totalPaginas = 1;
  eliminandoId: string | null = null;

  /** Pide los registros al backend. */
  protected abstract cargar$(): Observable<{ data: T[] }>;
  /** Elimina un registro en el backend. */
  protected abstract eliminar$(id: string): Observable<unknown>;
  /** Texto donde se busca (nombre, DNI, etc.). */
  protected abstract textoBuscable(item: T): string;
  /** Cómo se nombra el registro en los mensajes, ej. "el cliente Juan Pérez". */
  protected abstract descripcion(item: T): string;
  /** Nombre del recurso en plural para los mensajes, ej. "clientes". */
  protected abstract readonly recurso: string;

  ngOnInit(): void {
    this.recargar();
  }

  recargar(): void {
    this.cargando = true;
    this.error = '';
    this.cargar$().subscribe({
      next: (respuesta) => {
        this.items = respuesta.data ?? [];
        this.cargando = false;
        this.aplicarFiltro();
      },
      error: (err: HttpErrorResponse) => {
        this.cargando = false;
        this.items = [];
        this.aplicarFiltro();
        this.error = err.status === 0
          ? 'No se pudo conectar con el servidor.'
          : `No se pudo cargar el listado de ${this.recurso}.`;
      },
    });
  }

  /** Se llama al escribir en el buscador. */
  buscar(texto: string): void {
    this.busqueda = texto;
    this.pagina = 1;
    this.aplicarFiltro();
  }

  cambiarPagina(pagina: number): void {
    this.pagina = pagina;
    this.aplicarFiltro();
  }

  get filtrados(): T[] {
    const termino = this.normalizar(this.busqueda);
    return termino ? this.items.filter((item) => this.normalizar(this.textoBuscable(item)).includes(termino)) : this.items;
  }

  confirmarEliminar(item: T): void {
    this.confirmacion
      .confirmar({
        titulo: 'Confirmar eliminación',
        mensaje: `¿Eliminar ${this.descripcion(item)}? Esta acción no se puede deshacer.`,
        textoConfirmar: 'Eliminar',
        peligro: true,
      })
      .subscribe((confirmado) => {
        if (!confirmado) return;
        this.eliminandoId = item._id;
        this.eliminar$(item._id).subscribe({
          next: () => {
            this.eliminandoId = null;
            this.items = this.items.filter((i) => i._id !== item._id);
            this.aplicarFiltro();
            this.notificaciones.exito(`Se eliminó ${this.descripcion(item)}.`);
          },
          error: (err: HttpErrorResponse) => {
            this.eliminandoId = null;
            // El backend explica por qué no se puede (ej. 409 "tiene ventas asociadas")
            if (err.status !== 403) {
              this.notificaciones.error(err.error?.message ?? `No se pudo eliminar ${this.descripcion(item)}.`);
            }
          },
        });
      });
  }

  protected aplicarFiltro(): void {
    const lista = this.filtrados;
    this.totalPaginas = Math.max(1, Math.ceil(lista.length / this.porPagina));
    this.pagina = Math.min(this.pagina, this.totalPaginas);
    const inicio = (this.pagina - 1) * this.porPagina;
    this.visibles = lista.slice(inicio, inicio + this.porPagina);
  }

  private normalizar(texto: string): string {
    return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  }
}
