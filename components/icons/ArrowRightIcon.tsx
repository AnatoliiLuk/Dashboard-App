import type { SVGProps } from 'react';

function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
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
        d="M10.306 2.4q.387 0 .665.278L15.73 7.43q.27.284.27.665 0 .388-.27.658l-4.76 4.766a.94.94 0 0 1-.664.27.9.9 0 0 1-.659-.27l-.547-.556a.87.87 0 0 1-.279-.657.87.87 0 0 1 .279-.658l2.141-2.15H.855a.78.78 0 0 1-.618-.273A.98.98 0 0 1 0 8.563v-.936q0-.388.237-.661a.78.78 0 0 1 .618-.275h10.386L9.1 4.55a.9.9 0 0 1-.279-.665.9.9 0 0 1 .279-.666l.547-.541a.9.9 0 0 1 .659-.278"
      />
    </svg>
  );
}

export { ArrowRightIcon };
