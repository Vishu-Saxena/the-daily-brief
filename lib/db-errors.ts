type ServerInfo = { type?: string };
type DatabaseError = Error & { reason?: { servers?: Map<string, ServerInfo> } };

export function databaseErrorMessage(error: unknown) {
  const value = error as DatabaseError;
  const serverTypes = value?.reason?.servers ? Array.from(value.reason.servers.values()).map(server => server.type) : [];
  if (serverTypes.length > 0 && serverTypes.every(type => type === 'RSSecondary' || type === 'Unknown')) return 'MongoDB Atlas currently has no primary node available for writes. Resume the cluster or wait for Atlas to complete its election, then try again.';
  if (/ReplicaSetNoPrimary|Server selection|ECONNREFUSED|ENOTFOUND/i.test(value?.message || '')) return 'MongoDB is unreachable. Check that your Atlas cluster is running and your current IP is allowed in Network Access.';
  return null;
}
