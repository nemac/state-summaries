import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { useTheme } from "@mui/material/styles";
import Modal from "@mui/material/Modal";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import FormHelperText from "@mui/material/FormHelperText";
import Collapse from "@mui/material/Collapse";
import Box from "@mui/material/Box";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { green, red } from "@mui/material/colors";

const darkGrey = "#E6E6E6";
const errorBgColor = red[500];
const messageSentBgColor = green[700];

// const useStyles = makeStyles((theme) => ({
//   exportModal: {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   exportModalDiv: {
//     width: "500px",
//     [theme.breakpoints.down("sm")]: {
//       width: "80%",
//     },
//     backgroundColor: theme.palette.background.paper,
//     border: "0px solid transparent",
//     outline: "unset",
//     borderRadius: "4px",
//     padding: theme.spacing(2, 4, 3),
//   },
//   exportHeaderText: {
//     paddingBottom: theme.spacing(1),
//     borderBottom: `1px solid ${darkGrey}`,
//   },
//   exportContainer: {
//     paddingTop: theme.spacing(2),
//     display: "flex",
//     justifyContent: "flex-end",
//   },
//   exportStart: {
//     display: "flex",
//     marginRight: "auto",
//   },
//   exportEnd: {
//     display: "flex",
//   },
//   exportDescriptionText: {
//     marginBottom: theme.spacing(2),
//     fontSize: ".9em",
//     [theme.breakpoints.down("sm")]: {
//       fontSize: ".75em",
//     },
//   },
//   exportButtons: {
//     marginLeft: theme.spacing(1),
//     marginRight: theme.spacing(1),
//   },
//   exportForm: {
//     display: "flex",
//     [theme.breakpoints.down("sm")]: {
//       flexDirection: "column",
//     },
//     alignItems: "flex-start",
//     justifyContent: "flex-start",
//     width: "100%",
//     marginTop: theme.spacing(2),
//     marginBottom: theme.spacing(2),
//   },
//   exportInputVerify: {
//     margin: theme.spacing(1),
//     marginBottom: theme.spacing(2),
//     width: "100%",
//   },
//   exportInput: {
//     margin: theme.spacing(1),
//     width: "100%",
//   },
//   exportHeaderIcon: {
//     fontSize: "1.65rem",
//     marginBottom: theme.spacing(-0.3),
//   },
//   exportMessage: {
//     margin: theme.spacing(1),
//     width: "100%",
//   },
//   figureErrorText: {
//     color: errorBgColor,
//     marginLeft: theme.spacing(2),
//     marginTop: theme.spacing(0),
//     paddingTop: theme.spacing(0),
//   },
//   messageSentText: {
//     color: messageSentBgColor,
//   },
//   messageSentFailedText: {
//     color: errorBgColor,
//   },
//   messageCheckCircleOutlineIcon: {
//     color: messageSentBgColor,
//     marginLeft: theme.spacing(3),
//     marginTop: theme.spacing(-1),
//     fontSize: "5rem",
//   },
//   messageHighlightOffIcon: {
//     color: errorBgColor,
//     marginLeft: theme.spacing(3),
//     marginTop: theme.spacing(-1),
//     fontSize: "5rem",
//   },
// }));

export default function SandboxSumbitFigure(props) {
  const { open } = props;
  const { handleCloseFigure } = props;
  const theme = useTheme();

  const heading = "Send to TSU";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [chapter, setChapter] = useState("");
  const [figureURL, _setFigureURL] = useState(window.location.href);
  const figureURLRef = useRef(figureURL);
  const setFigureURL = (data) => {
    figureURLRef.current = data;
    _setFigureURL(data);
  };

  const [message, setMessage] = useState("");
  // const [authorKey, setAuthorKey] = useState('');
  // const [authorVerified, setAuthorVerified] = useState(false);
  const [keyDisabled, setKeyDisabled] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [nameValid, setNamelValid] = useState(false);
  const [chapterValid, setChapterlValid] = useState(false);

  const [messageSent, setMessageSent] = useState(false);
  const [messageFailed, setMessageFailed] = useState(false);

  const emailErrorLabel = !emailValid ? (
    <FormHelperText
      style={{ display: keyDisabled ? "flex" : "flex" }}
      sx={{
        color: errorBgColor,
        marginLeft: theme.spacing(2),
        marginTop: theme.spacing(0),
        paddingTop: theme.spacing(0),
      }}
    >
      Email address is not valid
    </FormHelperText>
  ) : (
    ""
  );
  const NameErrorLabel = !nameValid ? (
    <FormHelperText
      style={{ display: keyDisabled ? "flex" : "flex" }}
      sx={{
        color: errorBgColor,
        marginLeft: theme.spacing(2),
        marginTop: theme.spacing(0),
        paddingTop: theme.spacing(0),
      }}
    >
      Required
    </FormHelperText>
  ) : (
    ""
  );
  const ChapterErrorLabel = !chapterValid ? (
    <FormHelperText
      style={{ display: keyDisabled ? "flex" : "flex" }}
      sx={{
        color: errorBgColor,
        marginLeft: theme.spacing(2),
        marginTop: theme.spacing(0),
        paddingTop: theme.spacing(0),
      }}
    >
      Required
    </FormHelperText>
  ) : (
    ""
  );

  // HTTP post headers
  const axiosConfig = {
    headers: {
      Accept: "*/*",
      "content-type": "application/json",
    },
  };

  // sumbit figure to slack or other message delivery
  const submitFigure = async () => {
    // get the current figures URL what it looks like
    setFigureURL(window.location.href);

    // get author key, submit URL, and setup JSON request data
    // const AUTHOR_KEY = authorKey;
    const sumbitURL =
      "https://v9bh75u4xh.execute-api.us-east-1.amazonaws.com/dev/submitEmail";
    const figureInfoMessage = {
      authorName: name,
      authorEmail: email,
      authorNote: message,
      chapter,
      figureURL: figureURLRef.current,
      // AUTHOR_KEY
    };

    // post the submission to the submit API
    try {
      const res = await axios.post(
        sumbitURL,
        JSON.stringify(figureInfoMessage),
        axiosConfig,
      );
      // check if message sent
      if (res.status === 200) {
        // message sent success
        setMessageSent(true);
        setKeyDisabled(false);
      } else {
        // message sent success failure
        setMessageFailed(false);
        setMessageSent(false);
      }
      return true;
    } catch (error) {
      // message sent success failure error in call
      setMessageFailed(false);
      setMessageSent(false);
      return false;
    }
  };

  // ensure name is at least chars assuming > 2 is a name of some sort
  const validateName = (text) => text.length >= 2;

  // validate if input text is an email address
  const validateEmailAddress = (text) => {
    if (text.length < 4) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
  };

  // handle name change
  const handleNameChange = (event) => {
    const contactName = event.currentTarget.value;
    setNamelValid(validateName(contactName));
    setName(contactName);
  };

  // handle email change
  const handleEmailChange = (event) => {
    const contactEmail = event.currentTarget.value;
    setEmailValid(validateEmailAddress(contactEmail));
    setEmail(contactEmail);
  };

  // handle chapter change
  const handleChapterChange = (event) => {
    const chapterName = event.currentTarget.value;
    setChapterlValid(validateName(chapterName));
    setChapter(chapterName);
  };

  // handle message change
  const handleMessageChange = (event) => {
    setMessage(event.currentTarget.value);
  };

  // handle export modal close event
  const handleClose = (event) => {
    handleCloseFigure(false);
    setMessageSent(false);
  };

  return (
    <Modal
      disableBackdropClick
      disableEscapeKeyDown
      open={open}
      onClose={handleClose}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <div
        sx={{
          width: "500px",
          [theme.breakpoints.down("sm")]: {
            width: "80%",
          },
        }}
      >
        <h2
          id="simple-modal-title"
          style={{
            paddingBottom: theme.spacing(1),
            borderBottom: `1px solid ${darkGrey}`,
          }}
        >
          <MailOutlineIcon
            sx={{ fontSize: "1.65rem", marginBottom: theme.spacing(-0.3) }}
          />{" "}
          {heading}
        </h2>
        <div
          style={{
            marginBottom: theme.spacing(2),
            fontSize: ".9em",
            [theme.breakpoints.down("sm")]: {
              fontSize: ".75em",
            },
          }}
        >
          To submit the current figure, please include your email, name, and any
          details about the figure.
        </div>

        <Collapse in={messageSent}>
          <Box display="flex" alignContent="center">
            <CheckCircleOutlineIcon
              sx={{
                color: messageSentBgColor,
                marginLeft: theme.spacing(3),
                marginTop: theme.spacing(-1),
                fontSize: "5rem",
              }}
            />
            <h2 id="simple-modal-title" style={{ color: messageSentBgColor }}>
              Figure submitted successfully!
            </h2>
          </Box>
        </Collapse>

        <Collapse in={messageFailed}>
          <Box display="flex" alignContent="center">
            <HighlightOffIcon
              sx={{
                color: errorBgColor,
                marginLeft: theme.spacing(3),
                marginTop: theme.spacing(-1),
                fontSize: "5rem",
              }}
            />
            <h2 id="simple-modal-title" style={{ color: errorBgColor }}>
              Figure submitted failed, please try again!
            </h2>
          </Box>
        </Collapse>
        <Collapse in={!keyDisabled}>
          <FormControl
            sx={{
              display: "flex",
              [theme.breakpoints.down("sm")]: {
                flexDirection: "column",
              },
              alignItems: "flex-start",
              justifyContent: "flex-start",
              width: "100%",
              marginTop: theme.spacing(2),
              marginBottom: theme.spacing(2),
            }}
          >
            <TextField
              sx={{ margin: theme.spacing(1), width: "100%" }}
              id="outlined-text-name"
              size="small"
              required
              variant="outlined"
              label="Name"
              type="text"
              disabled={keyDisabled}
              value={name}
              onChange={handleNameChange}
              error={!nameValid}
              InputLabelProps={{ shrink: true }}
            />
            {NameErrorLabel}
            <TextField
              sx={{ margin: theme.spacing(1), width: "100%" }}
              id="outlined-text-email"
              size="small"
              required
              variant="outlined"
              label="Email"
              type="text"
              disabled={keyDisabled}
              value={email}
              onChange={handleEmailChange}
              error={!emailValid}
              InputLabelProps={{ shrink: true }}
            />
            {emailErrorLabel}
            <TextField
              sx={{ margin: theme.spacing(1), width: "100%" }}
              id="outlined-text-chapter"
              size="small"
              required
              variant="outlined"
              label="NCA Chapter"
              type="text"
              disabled={keyDisabled}
              value={chapter}
              onChange={handleChapterChange}
              error={!nameValid}
              InputLabelProps={{ shrink: true }}
            />
            {ChapterErrorLabel}
            <TextField
              sx={{ margin: theme.spacing(1), width: "100%" }}
              id="outlined-text-message"
              size="small"
              variant="outlined"
              label="Notes or Comments"
              type="text"
              disabled={keyDisabled}
              value={message}
              rows={4}
              multiline
              onChange={handleMessageChange}
              InputLabelProps={{ shrink: true }}
            />
          </FormControl>
        </Collapse>

        <div
          style={{
            paddingTop: theme.spacing(2),
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <div style={{ display: "flex", marginRight: "auto" }}>
            <Button
              sx={{
                marginLeft: theme.spacing(1),
                marginRight: theme.spacing(1),
              }}
              onClick={submitFigure}
              color="primary"
              variant="contained"
              disabled={keyDisabled || !nameValid || !emailValid}
              startIcon={<MailOutlineIcon />}
            >
              Submit Figure
            </Button>
          </div>
          <div style={{ display: "flex" }}>
            <Button
              sx={{
                marginLeft: theme.spacing(1),
                marginRight: theme.spacing(1),
              }}
              onClick={handleClose}
              color="default"
              variant="contained"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

SandboxSumbitFigure.propTypes = {
  handleCloseFigure: PropTypes.func,
  open: PropTypes.bool,
};
