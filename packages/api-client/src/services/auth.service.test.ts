import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { apiClient } from '../index';
import { login, forgotPassword, forgotPasswordConfirm, getMe } from './auth.service';

describe('auth.service', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.restore();
  });

  it('should export login, forgotPassword, forgotPasswordConfirm, getMe', () => {
    expect(typeof login).toBe('function');
    expect(typeof forgotPassword).toBe('function');
    expect(typeof forgotPasswordConfirm).toBe('function');
    expect(typeof getMe).toBe('function');
  });

  it('login: should resolve with user data', async () => {
    mock.onPost('/auth/login').reply(200, { success: true, message: 'ok', data: { user: { email: 'a@a.com', role: 'admin' }, session: {}, nextRoute: '/' } });
    const res = await login({ email: 'a@a.com', password: '1234' });
    expect(res.success).toBe(true);
    expect(res.data.user.email).toBe('a@a.com');
  });

  it('login: should resolve with user data on success', async () => {
    mock.onPost('/auth/login').reply(200, {
      success: true,
      message: 'ok',
      data: {
        user: { email: 'test@nanutech.com', role: 'admin' },
        session: { provider: 'local', tokenType: 'Bearer', expiresAt: '2099-01-01', idleTimeoutSeconds: 3600 },
        nextRoute: '/dashboard'
      }
    });
    const res = await login({ email: 'test@nanutech.com', password: '1234' });
    expect(res.success).toBe(true);
    expect(res.data.user.email).toBe('test@nanutech.com');
    expect(res.data.user.role).toBe('admin');
    expect(res.data.session.provider).toBe('local');
  });

  it('login: should throw readable error on 401', async () => {
    mock.onPost('/auth/login').reply(401);
    await expect(login({ email: 'fail', password: 'fail' })).rejects.toThrow('Credenciales incorrectas.');
  });

  it('forgotPassword: should resolve with message', async () => {
    mock.onPost('/auth/forgot-password').reply(200, { message: 'Enviado' });
    const msg = await forgotPassword({ email: 'a@a.com' });
    expect(msg).toMatch(/enviado/i);
  });

  it('forgotPassword: should throw readable error on 404', async () => {
    mock.onPost('/auth/forgot-password').reply(404);
    await expect(forgotPassword({ email: 'no@no.com' })).rejects.toThrow('No encontramos una cuenta con ese correo.');
  });

  it('forgotPasswordConfirm: should resolve with message', async () => {
    mock.onPost('/auth/forgot-password/confirm').reply(200, { message: 'Contraseña restablecida correctamente.' });
    const msg = await forgotPasswordConfirm({ email: 'a@a.com', code: '123', newPassword: 'new' });
    expect(msg).toMatch(/restablecida/i);
  });

  it('forgotPasswordConfirm: should throw readable error on 400', async () => {
    mock.onPost('/auth/forgot-password/confirm').reply(400);
    await expect(forgotPasswordConfirm({ email: 'a@a.com', code: 'bad', newPassword: 'fail' })).rejects.toThrow('Código inválido o expirado.');
  });
});
