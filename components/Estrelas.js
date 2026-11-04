'use client';

export default function Estrelas({ nota, onChange }) {
  return (
    <p className="mb-0">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`fa-star star ${n <= nota ? 'fa-solid' : 'fa-regular'}`}
          onClick={(e) => {
            e.stopPropagation();
            onChange(n);
          }}
        />
      ))}
    </p>
  );
}
