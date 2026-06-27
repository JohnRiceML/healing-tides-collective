// Pure response-lifecycle state machine for the OpenAI Realtime tool loop.
// Ported verbatim from counsel-post's voice-lab (domain-agnostic).
//
// The serialization invariant: the Realtime API rejects an overlapping `response.create`, so
// there must be AT MOST ONE active response, and a turn with N batched tool calls must emit
// EXACTLY ONE continuation (not N). It must never wedge: a rejected `response.create` emits no
// response.created/response.done, so the optimistic "active" flag is releasable on `error`.

export interface ResponseLoopState {
  responseActive: boolean;
  pendingTools: number;
  wantResponse: boolean;
}

export interface ResponseLoop {
  onResponseCreated(): void;
  onResponseDone(): void;
  onError(): void;
  onToolStart(): void;
  /** Returns true iff this was the LAST pending tool of the turn. */
  onToolSettled(): boolean;
  requestResponse(): void;
  reset(): void;
  readonly state: Readonly<ResponseLoopState>;
}

/**
 * @param send Transmit a `response.create` now. MUST return true iff it actually went out
 *   (channel open). When false, the slot is NOT claimed, so a request against a closed channel
 *   is simply dropped.
 */
export function createResponseLoop(send: () => boolean): ResponseLoop {
  const s: ResponseLoopState = { responseActive: false, pendingTools: 0, wantResponse: false };

  function fireDeferredIfReady(): void {
    if (s.wantResponse && s.pendingTools <= 0) {
      s.wantResponse = false;
      requestResponse();
    }
  }

  function requestResponse(): void {
    if (s.responseActive || s.pendingTools > 0) {
      s.wantResponse = true;
      return;
    }
    if (send()) s.responseActive = true;
  }

  return {
    onResponseCreated() {
      s.responseActive = true;
    },
    onResponseDone() {
      s.responseActive = false;
      fireDeferredIfReady();
    },
    onError() {
      s.responseActive = false;
      fireDeferredIfReady();
    },
    onToolStart() {
      s.pendingTools += 1;
    },
    onToolSettled() {
      s.pendingTools = Math.max(0, s.pendingTools - 1);
      return s.pendingTools <= 0;
    },
    requestResponse,
    reset() {
      s.responseActive = false;
      s.pendingTools = 0;
      s.wantResponse = false;
    },
    get state() {
      return s;
    },
  };
}
