/**
 * Maps Firebase error codes and generic JS errors to user-friendly messages in French.
 * Covers auth, Firestore, network, and player errors.
 */
export function friendlyError(error: unknown, fallback?: string): string {
  if (typeof error === 'string') return mapCode(error) || error;

  if (error instanceof Error) {
    // Firebase errors expose a `code` property
    const code = (error as {code?: string}).code;
    if (code) {
      const mapped = mapCode(code);
      if (mapped) return mapped;
    }
    // Fallback to a simplified version of the message
    return simplifyMessage(error.message) || fallback || 'Une erreur inattendue est survenue.';
  }

  return fallback || 'Une erreur inattendue est survenue.';
}

function mapCode(code: string): string | null {
  // ── Firebase Auth ──────────────────────────────────────────────────────
  const authMap: Record<string, string> = {
    'auth/invalid-email':               'Adresse email invalide.',
    'auth/user-not-found':              'Aucun compte trouvé avec cet email.',
    'auth/wrong-password':              'Mot de passe incorrect. Réessayez.',
    'auth/invalid-credential':          'Identifiants incorrects. Vérifiez votre email et mot de passe.',
    'auth/email-already-in-use':        'Cette adresse email est déjà utilisée par un autre compte.',
    'auth/weak-password':               'Mot de passe trop faible. Utilisez au moins 8 caractères.',
    'auth/user-disabled':               'Ce compte a été désactivé. Contactez le support.',
    'auth/too-many-requests':           'Trop de tentatives. Attendez quelques minutes avant de réessayer.',
    'auth/network-request-failed':      'Connexion réseau impossible. Vérifiez votre connexion internet.',
    'auth/requires-recent-login':       'Session expirée. Veuillez vous reconnecter.',
    'auth/operation-not-allowed':       'Cette méthode de connexion n\'est pas activée.',
    'auth/account-exists-with-different-credential':
      'Un compte existe déjà avec cet email via une autre méthode de connexion.',
    'auth/popup-closed-by-user':        'Connexion annulée.',
    'auth/cancelled-popup-request':     'Connexion annulée.',
    'auth/expired-action-code':         'Le lien a expiré. Demandez-en un nouveau.',
    'auth/invalid-action-code':         'Le lien est invalide ou a déjà été utilisé.',
    // ── Firebase Firestore ──────────────────────────────────────────────
    'firestore/permission-denied':      'Accès refusé. Vous n\'avez pas les droits nécessaires.',
    'firestore/not-found':              'Ressource introuvable.',
    'firestore/unavailable':            'Service temporairement indisponible. Réessayez plus tard.',
    'firestore/deadline-exceeded':      'La requête a pris trop de temps. Réessayez.',
    'firestore/resource-exhausted':     'Quota dépassé. Réessayez dans un moment.',
    // ── Storage ────────────────────────────────────────────────────────
    'storage/unauthorized':             'Vous n\'avez pas l\'autorisation d\'accéder à ce fichier.',
    'storage/object-not-found':         'Fichier introuvable.',
    'storage/quota-exceeded':           'Quota de stockage dépassé.',
    'storage/retry-limit-exceeded':     'Impossible de charger le fichier après plusieurs tentatives.',
    // ── Network ────────────────────────────────────────────────────────
    'network-error':                    'Connexion réseau impossible. Vérifiez votre connexion internet.',
    NETWORK_ERROR:                      'Connexion réseau impossible. Vérifiez votre connexion internet.',
  };

  return authMap[code] || null;
}

function simplifyMessage(message: string): string | null {
  const lower = message.toLowerCase();
  if (lower.includes('network') || lower.includes('réseau')) {
    return 'Connexion réseau impossible. Vérifiez votre connexion internet.';
  }
  if (lower.includes('permission') || lower.includes('unauthorized')) {
    return 'Accès refusé. Vous n\'avez pas les droits nécessaires.';
  }
  if (lower.includes('not found') || lower.includes('introuvable')) {
    return 'Ressource introuvable.';
  }
  if (lower.includes('timeout') || lower.includes('deadline')) {
    return 'La requête a pris trop de temps. Réessayez.';
  }
  return null;
}
