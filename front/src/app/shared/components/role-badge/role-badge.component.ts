import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-role-badge',
  standalone: true,
  templateUrl: './role-badge.component.html',
  styleUrl: './role-badge.component.css'
})
export class RoleBadgeComponent {
  @Input() role: string = 'invitado';
  @Output() roleClick = new EventEmitter<string>();

  emitRole(): void {
    this.roleClick.emit(this.role);
  }
}
