import React, { useRef, useState, ReactNode, FC } from "react";
import ReactModal from "react-modal";
import styled, { createGlobalStyle } from "styled-components/macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import cloneDeep from "lodash.clonedeep";
import uniqueId from "lodash.uniqueid";

import { Button, ButtonLabel, ListButton } from "./Button";
import { Caret, Content as ExpandingContent } from "./Expand";
import TextBlock from "./TextBlock";

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

  @media(min-width: 600px) {
    min-width: 500px;
  }
`;

const ModalTitlebar = styled(TextBlock).attrs({
  align: "left",
  fontSize: "large",
})`
  border-bottom: 1px solid ${({ theme }) => theme.textColor};
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
  padding: 0.5rem 0;
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
        <span id={titleId}>{title}</span>
        <ModalTitlebarButton
          role="button"
          icon={faTimes}
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

/** The contents of an alert. */
export interface AlertContents {
  title: string;
  description: string;
  details?: string;
}

export interface AlertProps extends AlertContents {
  isOpen: boolean;

  onRequestClose?: () => void;
}

/**
 * An alert popup with a title, description and optional details.
 */
export const Alert: FC<AlertProps> = ({
  description,
  details,
  isOpen,
  title,
  onRequestClose,
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
      onRequestClose={onRequestClose}
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
        <Button ref={okButtonRef} fontSize="large" onClick={onRequestClose}>
          OK
        </Button>
      </AlertContent>
    </Modal>
  );
};

/** A hook that manages a stack of alerts within an application. */
export const useAlerts = (): {
  alerts: ReactNode[];
  addAlert: (contents: AlertContents) => void;
} => {
  const [alertProps, setAlertProps] = useState<AlertProps[]>([]);
  const alertClose = () =>
    setAlertProps((alertProps) => {
      const newAlertProps = cloneDeep(alertProps);
      newAlertProps[newAlertProps.length - 1].isOpen = false;
      return newAlertProps;
    });

  return {
    alerts: alertProps.map((props) => <Alert {...props} />),
    addAlert: (contents: AlertContents) => {
      setAlertProps((alertProps) =>
        alertProps
          .filter((alert) => alert.isOpen)
          .concat({ ...contents, isOpen: true, onRequestClose: alertClose })
      );
    },
  };
};
