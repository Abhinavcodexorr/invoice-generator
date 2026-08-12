"use client";

import { useState } from "react";

interface SaveSendModalProps {
  open: boolean;
  defaultTo?: string;
  onClose: () => void;
  onSend: (payload: {
    to: string;
    subject: string;
    message: string;
  }) => Promise<void>;
}

export function SaveSendModal({
  open,
  defaultTo = "",
  onClose,
  onSend,
}: SaveSendModalProps) {
  const [to, setTo] = useState(defaultTo);
  const [subject, setSubject] = useState("Invoice");
  const [message, setMessage] = useState(
    "Please find your invoice attached. Thank you for your business!",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(13,27,42,0.45)] p-4 backdrop-blur-sm animate-fade">
      <div className="panel animate-pop w-full max-w-md p-6">
        <h2 className="font-display text-2xl font-bold tracking-tight">Save & Send</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Email a PDF copy of this document.
        </p>

        <form
          className="mt-5 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError(null);
            try {
              await onSend({ to, subject, message });
              onClose();
            } catch (err) {
              setError(err instanceof Error ? err.message : "Failed to send");
            } finally {
              setLoading(false);
            }
          }}
        >
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--muted)]">To</span>
            <input
              required
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="field"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--muted)]">Subject</span>
            <input
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="field"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--muted)]">Message</span>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="field"
            />
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? "Sending…" : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
