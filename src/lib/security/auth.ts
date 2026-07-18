export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
}

export function getAuthUser(request: Request): AuthUser | null {
  const jwt = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!jwt) return null;

  try {
    const payload = JSON.parse(atob(jwt.split(".")[1])) as {
      sub?: string;
      email?: string;
      name?: string;
    };

    if (!payload.sub) return null;

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  } catch {
    return null;
  }
}
