import React, { useRef, useState, ReactNode, FC } from "react";
import ReactModal from "react-modal";
import styled, { createGlobalStyle } from "styled-components/macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import uniqueId from "lodash.uniqueid";

import { BorderedButton, ButtonLabel, ListButton } from "./Button";
import { Caret, Content as ExpandingContent } from "./Expand";

const ModalOverlay = createGlobalStyle`
  .modal-overlay {
    align-items: center;
    background: ${({ theme }) => theme.modalOverlayColor};
    display: flex;
    height: 100%;
    justify-content: center;
    left: 0;
    position: fixed;
    top: 0;
    width: 100vw;
  }
`;

interface StyledModalProps {
  className: string;
  closeTimeoutMS: number;
  isOpen: boolean;

  [k: string]: any;
}

const StyledModal = styled(
  ({ className, isOpen, ...rest }: StyledModalProps) => (
    <ReactModal
      isOpen={isOpen}
      className={{
        base: className,
        afterOpen: "modal-after-open",
        beforeClose: "modal-before-close",
      }}
      overlayClassName="modal-overlay"
      {...rest}
    />
  )
)<StyledModalProps>`
  background: ${({ theme }) => theme.backgroundColor};
  box-shadow: 8px 8px 16px ${({ theme }) => theme.shadowColor};
  contain: content;
  max-height: 100%;
  max-width: 100%;
  min-width: 300px;
  opacity: 0;
  outline: none;
  padding: 0.5rem;

  &.modal-after-open {
    opacity: 1;
    transition: opacity ${({ closeTimeoutMS }) => `${closeTimeoutMS}ms`}
      ease-in-out;
  }

  &.modal-before-close {
    opacity: 0;
  }
`;

const ModalTitlebar = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.textColor};
  height: 2.5rem;
`;

const ModalTitle = styled.span`
  font-size: 1.5rem;
  line-height: 2rem;
  vertical-align: middle;
`;

const ModalTitlebarButton = styled(FontAwesomeIcon)`
  cursor: pointer;
  float: right;
  margin-left: 0.5rem;
`;

const ModalChildren = styled.div`
  max-height: calc(100 * var(--vh) - 3rem);
  max-width: 100vw;
  overflow-y: auto;
`;

interface ModalPropTypes {
  aria?: { [k: string]: string };
  children: ReactNode;
  isOpen: boolean;
  title: string;

  onRequestClose?: () => void;

  [k: string]: any;
}

/** A modal dialog with a consistent style. */
export const Modal: FC<ModalPropTypes> = ({
  aria,
  children,
  isOpen,
  onRequestClose,
  title,
  ...rest
}) => {
  const titleId = uniqueId("modal-title-");

  return (
    <StyledModal
      aria={{ ...aria, labelledby: titleId }}
      closeTimeoutMS={200}
      contentLabel={title}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      {...rest}
    >
      <ModalOverlay />
      <ModalTitlebar>
        <ModalTitle id={titleId}>{title}</ModalTitle>
        <ModalTitlebarButton
          role="button"
          icon={faTimes}
          size="2x"
          className="Modal-close"
          onClick={onRequestClose}
        />
      </ModalTitlebar>
      <ModalChildren>{children}</ModalChildren>
    </StyledModal>
  );
};

const AlertContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`;

const AlertDescription = styled.div`
  flex-grow: 1;
  min-height: 5rem;
  max-width: 25rem;
  user-select: text;
  width: 100vw;
`;

const AlertDetails = styled.p`
  color: ${({ theme }) => theme.mutedTextColor};
  user-select: text;
`;

interface AlertProps {
  description: string;
  details?: string;
  isOpen: boolean;
  title: string;

  handleAlertClose?: () => void;
}

/**
 * An alert popup with a title, description and optional details.
 */
export const Alert: FC<AlertProps> = ({
  description,
  details,
  handleAlertClose,
  isOpen,
  title,
}) => {
  const [areDetailsExpanded, setAreDetailsExpanded] = useState(false);
  const descriptionId = uniqueId("alert-description-");
  const okButtonRef = useRef<HTMLButtonElement | null>(null);

  return (
    <Modal
      role="alert"
      aria={{ describedby: descriptionId }}
      isOpen={isOpen}
      title={title}
      onAfterOpen={() => okButtonRef.current && okButtonRef.current.focus()}
      onRequestClose={handleAlertClose}
    >
      <AlertContent>
        <AlertDescription id={descriptionId}>
          <p>{description}</p>
          {details && (
            <>
              <ListButton
                aria-expanded={areDetailsExpanded}
                onClick={() => setAreDetailsExpanded(!areDetailsExpanded)}
              >
                <ButtonLabel>Details</ButtonLabel>
                <Caret isExpanded={areDetailsExpanded} />
              </ListButton>
              <ExpandingContent isExpanded={areDetailsExpanded}>
                <AlertDetails>{details}</AlertDetails>
              </ExpandingContent>
            </>
          )}
        </AlertDescription>
        <BorderedButton
          ref={okButtonRef}
          fontSizeRem={1.5}
          onClick={handleAlertClose}
        >
          OK
        </BorderedButton>
      </AlertContent>
    </Modal>
  );
};
