export interface HealthProbe {
  database(): Promise<void>;
  redis(): Promise<void>;
}

export async function checkHealth(probe: HealthProbe): Promise<{ healthy: boolean; database: boolean; redis: boolean }> {
  const [database, redis] = await Promise.all([
    probe.database().then(() => true, () => false),
    probe.redis().then(() => true, () => false),
  ]);
  return { healthy: database && redis, database, redis };
}
