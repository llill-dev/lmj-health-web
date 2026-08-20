type DoctorUserRef = {
  userId?:
    | string
    | {
        _id?: string;
      }
    | null;
};

/** Resolve linked user id for POST /admin/users/:userId/offboard. */
export function resolveAdminDoctorUserId(
  doctor: DoctorUserRef | null | undefined,
): string | null {
  const uid = doctor?.userId;
  if (typeof uid === 'string' && uid.trim()) return uid.trim();
  if (uid && typeof uid === 'object' && typeof uid._id === 'string') {
    const id = uid._id.trim();
    return id || null;
  }
  return null;
}
