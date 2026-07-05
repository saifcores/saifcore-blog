type DiagramFigureProps = {
  title?: string;
  caption?: string;
  /** Original `.drawio` path — shown as downloadable source. */
  source?: string;
  children: React.ReactNode;
};

export function DiagramFigure({
  title,
  caption,
  source,
  children,
}: DiagramFigureProps) {
  return (
    <figure className="diagram-figure">
      {title ? (
        <figcaption className="diagram-figure-title">{title}</figcaption>
      ) : null}
      <div className="diagram-figure-body">{children}</div>
      {caption || source ? (
        <figcaption className="diagram-figure-caption">
          {caption ? <p>{caption}</p> : null}
          {source ? (
            <p className="diagram-figure-source">
              Source:{" "}
              <a href={source} download>
                {source.split("/").pop()}
              </a>
            </p>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
