import type { ServerEvent } from "@repo/protocol";

export interface Peer {
  /** Unique per connection. */
  readonly id: string;
  /** Stable per Google account; one user may hold several connections. */
  readonly userId: string;
  send(event: ServerEvent): void;
}

/**
 * Pairs waiting peers first-come-first-served and relays events between partners.
 * Holds no socket state, so it can be driven directly in tests.
 */
export class Matchmaker {
  private readonly queue: Peer[] = [];
  private readonly partners = new Map<Peer, Peer>();
  /** The user each peer last chatted with, so "next" never rematches them straight away. */
  private readonly lastPartnerUser = new Map<Peer, string>();

  find(peer: Peer): void {
    this.leave(peer);

    const index = this.queue.findIndex(
      (candidate) =>
        candidate.userId !== peer.userId &&
        this.lastPartnerUser.get(peer) !== candidate.userId &&
        this.lastPartnerUser.get(candidate) !== peer.userId,
    );

    if (index === -1) {
      this.queue.push(peer);
      peer.send({ type: "searching" });
      return;
    }

    const [partner] = this.queue.splice(index, 1) as [Peer];
    this.partners.set(peer, partner);
    this.partners.set(partner, peer);
    this.lastPartnerUser.set(peer, partner.userId);
    this.lastPartnerUser.set(partner, peer.userId);
    peer.send({ type: "matched" });
    partner.send({ type: "matched" });
  }

  /** Returns false when the peer has no partner to deliver to. */
  relay(peer: Peer, event: ServerEvent): boolean {
    const partner = this.partners.get(peer);
    if (!partner) return false;
    partner.send(event);
    return true;
  }

  leave(peer: Peer): void {
    const queued = this.queue.indexOf(peer);
    if (queued !== -1) this.queue.splice(queued, 1);

    const partner = this.partners.get(peer);
    if (partner) {
      this.partners.delete(peer);
      this.partners.delete(partner);
      partner.send({ type: "partner_left" });
    }
  }

  disconnect(peer: Peer): void {
    this.leave(peer);
    this.lastPartnerUser.delete(peer);
  }

  get waitingCount(): number {
    return this.queue.length;
  }

  get chattingCount(): number {
    return this.partners.size;
  }
}
