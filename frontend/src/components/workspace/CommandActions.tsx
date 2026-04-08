import React from "react";

type Props = {
  reportPdfHref: string | null;
  error: string;
};

/** Secondary actions only (primary Run lives in Topbar). */
export default function CommandActions({ reportPdfHref, error }: Props) {
  return (
    <section className="card command-card command-card--secondary" aria-label="Exports and errors">
      <div className="command-actions-row">
        {reportPdfHref ? (
          <a className="button-link" href={reportPdfHref} target="_blank" rel="noreferrer">
            Download PDF report
          </a>
        ) : (
          <span className="muted">PDF is available after a successful run.</span>
        )}
      </div>
      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
