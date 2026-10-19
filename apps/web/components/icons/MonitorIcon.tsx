import type { SVGProps } from 'react';

function MonitorIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="none"
      viewBox="0 0 16 16"
      aria-hidden="true"
      {...props}
    >
      <g fill={props.color || 'currentColor'}>
        <path
          fillRule="evenodd"
          d="M2 2.25h12c.69 0 1.25.56 1.25 1.25v6.5c0 .69-.56 1.25-1.25 1.25H2c-.69 0-1.25-.56-1.25-1.25V3.5c0-.69.56-1.25 1.25-1.25m1.15 1.4v6.2h9.7v-6.2z"
          clipRule="evenodd"
        />
        <path d="M6.35 11.9h3.3v1.15h-3.3zM4.2 13.35h7.6a.7.7 0 0 1 0 1.4H4.2a.7.7 0 0 1 0-1.4" />
      </g>
    </svg>
  );
}

export { MonitorIcon };
