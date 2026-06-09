
export const locale = "es-AR";

export function startOfLocalMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

export function endOfLocalMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1, 0, 0, 0, 0);
}

export function startOfLocalDay(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function formatDateNumeric(date: Date): string {
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

export function getErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return "No se pudo iniciar sesión. Intentá de nuevo.";

  const msg = error.message.toLowerCase();

  if (msg.includes("invalid login credentials") || msg.includes("invalid email or password")) {
    return "Email o contraseña incorrectos. Verificá tus datos e intentá de nuevo.";
  }
  if (msg.includes("email not confirmed")) {
    return "Tu cuenta no está confirmada. Revisá tu correo para activarla.";
  }
  if (msg.includes("too many requests") || msg.includes("rate limit")) {
    return "Demasiados intentos fallidos. Esperá unos minutos antes de volver a intentar.";
  }
  if (msg.includes("user not found") || msg.includes("no user found")) {
    return "No existe una cuenta con ese email. Verificá que esté bien escrito.";
  }
  if (msg.includes("network") || msg.includes("fetch") || msg.includes("failed to fetch")) {
    return "Sin conexión a internet. Verificá tu red e intentá de nuevo.";
  }
  if (msg.includes("completa email y contraseña")) {
    return "Por favor ingresá tu email y contraseña para continuar.";
  }

  return error.message;
}



