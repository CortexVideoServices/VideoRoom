import React from 'react';

interface Props {
  className?: string;
}

function SignupForm({ className }: Props) {
  return (
    <div className={className}>
      <p>Signup form</p>
    </div>
  );
}

export default SignupForm;
