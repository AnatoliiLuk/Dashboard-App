import type { SVGProps } from 'react';

function ArrowLeftIcon(props: SVGProps<SVGSVGElement>) {
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
      <path
        fill={props.color || 'currentColor'}
        d="M5.694 2.4a.9.9 0 0 1 .659.278l.547.54a.9.9 0 0 1 .279.667q0 .387-.279.665L4.76 6.69h10.386a.78.78 0 0 1 .618.275.98.98 0 0 1 .237.66v.936q0 .389-.237.663a.78.78 0 0 1-.618.273H4.759l2.141 2.15a.87.87 0 0 1 .279.658.87.87 0 0 1-.279.657l-.547.556q-.27.27-.659.27a.94.94 0 0 1-.665-.27L.271 8.753A.9.9 0 0 1 0 8.095q0-.38.27-.665l4.76-4.752a.9.9 0 0 1 .664-.278"
      />
    </svg>
  );
}

export { ArrowLeftIcon };
