import { createGlobalStyle} from "styled-components"
export const GlobalStyles = createGlobalStyle`
  body {
    background: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text};
    font-family: Inconsolata;
    transition: all 0.50s linear;
  }

  .header {
    background: ${({ theme }) => theme.body};
    transition: all 0.50s linear;
  }

  .gallery__search {
    background: ${({ theme }) => theme.body};
    transition: all 0.50s linear;
  }

  .content {
    background: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text};
    transition: all 0.50s linear;
  }

  .verification {
    background: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text};
  }

  .accordion__children {
    background: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text};
  }

  .popup__content {
    background: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text};
  }

  .popup-content   {
    background: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text};
    padding: 0px;
  }

  .stylesheet__drawer{
    background: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text};
  }

  .stylesheet__drawer__palette_box {
    border: 4px solid ${({ theme }) => theme.body};
  }
  .popup-arrow {
    display: none !important;
  }

  .stylesheet__drawer__palette_box--select {
    border: 4px solid #DDDDDD;
  }

  input[type=text] {
    background: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text};
    transition: all 0.50s linear;
  }

  .popup-content {
    background: ${({ theme }) => theme.body} !important;
  }      
  input[type=password] {
    background: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text};
    transition: all 0.50s linear;
  }   

  textarea {
    background: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text};
}

.color-picker {
  background: ${({ theme }) => theme.body} !important;
    color: ${({ theme }) => theme.text} !important;
}

  `
