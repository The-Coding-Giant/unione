const arrowPaths = {
  'up-right': 'M5 19 19 5M7 5h12v12',
  'down-right': 'M5 5l14 14M7 19h12V7',
  down: 'M12 4v16m-6-6 6 6 6-6',
  up: 'M12 20V4m-6 6 6-6 6 6',
};

export function Arrow({ direction = 'up-right' }) {
  return (
    <svg className="icon-arrow" viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true" focusable="false">
      <path d={arrowPaths[direction]} />
    </svg>
  );
}

export function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M5 7v11a7 7 0 0 0 14 0V7M13 7v11a7 7 0 0 0 14 0V7" stroke="currentColor" strokeWidth="2.4" />
    </svg>
  );
}
