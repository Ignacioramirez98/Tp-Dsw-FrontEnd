import { avisoDeMail } from './venta';

describe('avisoDeMail', () => {
  it('si el mail salió, lo confirma con la dirección', () => {
    expect(avisoDeMail({ estado: 'enviado', para: 'juan@campo.com' })).toEqual({
      tipo: 'exito',
      texto: 'Le avisamos al cliente por mail (juan@campo.com).',
    });
  });

  it('si no salió o el cliente no tiene mail, pide avisarle por otro medio', () => {
    expect(avisoDeMail({ estado: 'fallido', para: 'juan@campo.com' })?.texto).toContain('por otro medio');
    expect(avisoDeMail({ estado: 'sin_mail' })?.texto).toContain('no tiene mail');
  });

  it('no dice nada si se eligió no avisar, si el envío está desactivado o si no hubo aviso', () => {
    expect(avisoDeMail({ estado: 'omitido' })).toBeNull();
    expect(avisoDeMail({ estado: 'desactivado' })).toBeNull();
    expect(avisoDeMail(null)).toBeNull();
    expect(avisoDeMail(undefined)).toBeNull();
  });
});
