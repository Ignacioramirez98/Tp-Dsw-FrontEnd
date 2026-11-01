import { TestBed } from '@angular/core/testing';
import { StatusChipComponent } from './status-chip.component';

describe('StatusChipComponent', () => {
  function render(estado: string): HTMLElement {
    const fixture = TestBed.createComponent(StatusChipComponent);
    fixture.componentRef.setInput('estado', estado);
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('span');
  }

  beforeEach(() => TestBed.configureTestingModule({ imports: [StatusChipComponent] }));

  it('muestra el estado con mayúscula inicial y su color', () => {
    const chip = render('pendiente');
    expect(chip.textContent?.trim()).toBe('Pendiente');
    expect(chip.classList).toContain('chip-pendiente');
  });

  it('reconoce estados en cualquier mayúscula/minúscula', () => {
    expect(render('FACTURADA').classList).toContain('chip-facturada');
  });

  it('usa un estilo neutro para estados desconocidos', () => {
    expect(render('En proceso').classList).toContain('chip-otro');
  });
});
