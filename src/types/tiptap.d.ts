import '@tiptap/core';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        fontSize: {
            /**
             * Set the font size
             */
            setFontSize: (size: string) => ReturnType;
            /**
             * Unset the font size
             */
            unsetFontSize: () => ReturnType;
        };
        lineHeight: {
            /**
             * Set the line height
             */
            setLineHeight: (lineHeight: string | null | undefined) => ReturnType;
            /**
             * Unset the line height
             */
            unsetLineHeight: () => ReturnType;
        };
    }
}
