import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { VentasService } from '../ventas/ventas.service.js';
import { ProductosService } from '../productos/producto.service.js';
import { Producto } from '../../shared/models/producto.model.js';  // Asegúrate de importar el tipo Producto
import { AuthService } from '../../shared/services/auth.service.js';  // Importamos el servicio de autenticación
import { Venta } from '../../shared/models/venta.model.js';
import { Servicio } from '../../shared/models/servicio.model.js';
import { MatDialog } from '@angular/material/dialog';
import { WarningComponent } from '../../shared/components/warning/warning.component.js';  // Importar el componente de modal


@Component({
  selector: 'app-confirmar-compra',
  templateUrl: './confirmar-compra.component.html',
  styleUrls: ['./confirmar-compra.component.css']
})
export class ConfirmarCompraComponent implements OnInit {
  clienteNombre: string = '';  // Nombre del cliente que se recuperará del servicio
  productosSeleccionados: Producto[] = [];  // Lista de productos seleccionados
  serviciosSeleccionados: Servicio[] = [];  // Asigna los servicios seleccionados
  cantidades: { [id: string]: number } = {};  // Cantidades de los productos seleccionados
  importeTotal: number = 0;
  clienteId: string | null = null;  // Variable para almacenar el clienteId
  apellidoCliente: string = '';  // Nueva variable para el apellido


  constructor(
    private router: Router,
    private ventasService: VentasService,
    private productosService: ProductosService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarDatosCliente();  // Obtener el cliente al inicializar el componente
    this.obtenerProductosSeleccionados();
    this.calcularImporteTotal();
  }

  cargarDatosCliente(): void {
    // Obtener el clienteId desde el servicio de autenticación
    this.clienteId = this.authService.getClienteId();
  
    if (this.clienteId) {
      // Si el clienteId está disponible, obtenemos los datos del cliente
      this.authService.obtenerCliente().subscribe(
        (response) => {
          const cliente = response.data;
          
          if (cliente && cliente.nombre) {
            this.clienteNombre = cliente.nombre;  // Asignamos el nombre del cliente
            this.apellidoCliente = cliente.apellido;  // Asignamos el apellido del cliente
          } else {
            this.clienteNombre = 'Nombre no disponible';
          }
        },
        (error) => {
          this.clienteNombre = 'Error al cargar el cliente';
        }
      );
    } else {
      this.clienteNombre = 'Cliente no encontrado';
    }
  }

  obtenerProductosSeleccionados(): void {
    // Cargar productos seleccionados y sus cantidades desde el servicio
    this.productosSeleccionados = this.productosService.getProductosSeleccionados();
    this.cantidades = this.productosService.getCantidades();
  }

  calcularImporteTotal(): void {
    // Calcular el importe total sumando el precio de cada producto multiplicado por su cantidad
    this.importeTotal = this.productosSeleccionados.reduce((total, producto) => {
      return total + (producto.importe_venta * this.cantidades[producto._id]);
    }, 0);
  }

  cancelar(): void {
    // Navegar de vuelta a la selección de productos
    this.router.navigate(['/seleccion-productos']);
  }

  confirmarCompra() {
    const nuevaVenta = new Venta(
      'pendiente',                         // Estado inicial
      new Date(),                          // Fecha de contacto
      new Date(),                          // Fecha de venta
      new Date(),                          // Fecha de entrega
      null,                                // Fecha de cancelación
      this.productosSeleccionados,         // Productos seleccionados
      this.serviciosSeleccionados          // Servicios seleccionados
    );

    this.ventasService.crearVenta(nuevaVenta).subscribe({
      next: (response) => {
        console.log('Venta creada exitosamente:', response);
        const dialogRef = this.openWarningMessage('¡Su venta fue procesada exitosamente!', 'green');
        this.productosService.limpiarProductosSeleccionados();

        setTimeout(() => {
          dialogRef.close();  // Cerrar el warning después de 0.5 segundos
          this.router.navigate(['/cliente-dashboard']); // Redirigir a la página cliente-dashboard
        }, 500); // 500 ms = 0.5 segundos
      },
      error: (error) => {
        const dialogRef = this.openWarningMessage('Hubo un error al procesar su venta. Intente nuevamente.', 'red');

        setTimeout(() => {
          dialogRef.close();  // Cerrar el warning después de 0.5 segundos
        }, 500); // 500 ms = 0.5 segundos
      }
    });
  }

  openWarningMessage(message: string, color: string = 'red'): any {
    const dialogRef = this.dialog.open(WarningComponent, {
      data: { message: message, color: color },
      panelClass: 'warning-message'  // Aplica la clase CSS para el estilo
    });

    return dialogRef;  // Devolver el dialogRef para usarlo fuera de la función
  }

}
