import React, {
  forwardRef,
  useId,
} from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<
  HTMLInputElement,
  InputProps
>(
  (
    {
      label,
      error,
      helperText,
      icon,
      rightElement,
      className = "",
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();

    const inputId =
      id || generatedId;

    const hasError =
      Boolean(error);

    return (
      <div className="w-full text-left">
        {/* Label */}

        {label && (
          <label
            htmlFor={inputId}
            className="
              mb-1.5
              block
              text-[10px]
              sm:text-xs
              font-black
              uppercase
              tracking-[0.12em]
              text-primary
            "
          >
            {label}
          </label>
        )}

        {/* Input wrapper */}

        <div className="relative flex items-center">
          {/* Left icon */}

          {icon && (
            <div
              className="
                pointer-events-none
                absolute
                left-4
                z-10
                flex
                items-center
                justify-center
                text-textMuted
              "
            >
              {icon}
            </div>
          )}

          {/* Input */}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={
              hasError
                ? "true"
                : undefined
            }
            className={`
              w-full
              min-h-[48px]

              rounded-2xl
              border
              bg-surfaceDark

              px-4
              py-3

              text-sm
              font-medium
              text-white

              outline-none

              placeholder:text-textMuted

              transition-all
              duration-200

              border-border

              hover:border-borderLight

              focus:border-primary
              focus:ring-1
              focus:ring-primary/40

              disabled:cursor-not-allowed
              disabled:opacity-50
              disabled:hover:border-border

              ${icon
                ? "pl-11"
                : ""
              }

              ${rightElement
                ? "pr-12"
                : ""
              }

              ${hasError
                ? `
                    border-error
                    focus:border-error
                    focus:ring-error/30
                  `
                : ""
              }

              ${className}

              [&:-webkit-autofill]:
              [-webkit-text-fill-color:white]

              [&:-webkit-autofill]:
              [transition:background-color_9999s_ease-in-out_0s]

              [&::-webkit-inner-spin-button]:
              appearance-none

              [&::-webkit-outer-spin-button]:
              appearance-none

              [appearance:textfield]
            `}
            {...props}
          />

          {/* Right element */}

          {rightElement && (
            <div
              className="
                absolute
                right-3.5
                z-10
                flex
                items-center
                justify-center
              "
            >
              {rightElement}
            </div>
          )}
        </div>

        {/* Error / helper */}

        {error ? (
          <p
            className="
              mt-1.5
              text-[10px]
              sm:text-xs
              font-bold
              text-error
            "
          >
            {error}
          </p>
        ) : helperText ? (
          <p
            className="
              mt-1.5
              text-[10px]
              text-textMuted
            "
          >
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName =
  "Input";

export default Input;