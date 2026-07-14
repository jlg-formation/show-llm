/**
 * Store observable minimaliste (pub/sub) — sans dépendance externe.
 * Tous les composants s'abonnent à l'état et sont notifiés à chaque mise à jour.
 */
export type Listener<T> = (state: T) => void;
export type Updater<T> = (state: T) => Partial<T>;

export class Store<T extends object> {
  private state: T;
  private listeners = new Set<Listener<T>>();

  constructor(initial: T) {
    this.state = initial;
  }

  /** Lecture de l'état courant. */
  get(): Readonly<T> {
    return this.state;
  }

  /** Mise à jour partielle de l'état, puis notification des abonnés. */
  set(patch: Partial<T> | Updater<T>): void {
    const partial = typeof patch === "function" ? patch(this.state) : patch;
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  /**
   * Abonnement. Le listener est appelé immédiatement avec l'état courant.
   * Retourne une fonction de désabonnement.
   */
  subscribe(listener: Listener<T>): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) listener(this.state);
  }
}
