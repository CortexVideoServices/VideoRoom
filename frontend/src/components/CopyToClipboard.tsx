import React, { useRef, PropsWithChildren, ButtonHTMLAttributes, DetailedHTMLProps } from 'react';

interface Props extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, any> {
  value: string;
}

function CopyToClipboard({ value, children = 'Copy', ...props }: PropsWithChildren<Props>) {
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);
  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          const hiddenInput = hiddenInputRef.current;
          if (hiddenInput != null) {
            navigator.clipboard
              .writeText(value)
              .then((result) => alert('Invitation link has copied to clipboard'))
              .catch((err) => {
                console.error(err);
                alert('Cannto copy invitation link to clipboard');
              });
          }
        }}
        {...props}
      >
        {children}
      </button>
      <input type="hidden" ref={hiddenInputRef} defaultValue={value} />
    </>
  );
}

export default CopyToClipboard;
