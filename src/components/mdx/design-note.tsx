type DesignNoteProps = {
  children: React.ReactNode;
};

export function DesignNote({ children }: DesignNoteProps) {
  return (
    <div className="border-l-4 border-indigo-500/50 pl-5 text-[var(--text-secondary)] leading-relaxed">
      {children}
    </div>
  );
}
