import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Avatar from "@material-ui/core/Avatar";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import { DialogContent, DialogContentText } from "@material-ui/core";
import SnackBar from "../SnackBar/SnackBar";
import styled from "styled-components";
import ErrorPage from "../ErrorPage/ErrorPage";

function ConfirmPaymentModal(props) {
  const order = props.cartStateArray.map((item) => {
    return { item_id: item._id, quantity: item.quantity };
  });
  const [test, setTest] = useState(true);
  const [message, setMessage] = useState("");
  console.log("props", props);
  const { open } = props;

  const handleClickOpen = () => {
    setTest(true);
  };

  const handleClose = () => {
    setTest(false);
  };

  //   const priceTotal = props.cartStateArray.map((item) => {
  //     return item.price;
  //   });

  const handleSubmit = (ev) => {
    ev.preventDefault();

    fetch("/order", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        order_summary: order,
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        setMessage(json.message);
        console.log("json", json);
      })
      .catch((err) => {
        console.log("message", err.message);
      });
  };
  console.log(message);
  return (
    <>
      <Dialog
        aria-labelledby="simple-dialog-title"
        open={test}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <Button onClick={() => handleClose(false)}>
          {" "}
          Close Order.. For Now..
        </Button>
        <form
          onSubmit={(ev) => {
            handleSubmit(ev);
            setTest(false);
          }}
        >
          <DialogTitle id="alert-dialog-title">
            {"Confirm Payment?"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {`Thank You For Shoppoing With Dragon Riders. Your total price: ${props.price}`}
            </DialogContentText>
          </DialogContent>
          <Test
            variant="outlined"
            label="Credit card"
            type="submit"
            value="CONFIRM"
            // onChange={ev => setCreditCard(ev.currentTarget.value)}
            style={{ flex: 2 }}
          />
        </form>
      </Dialog>
      <Wrapper>
        {message === "Successful Purchase!" ? (
          <SnackBar />
        ) : message === "Failure" ? (
          <BadSnack>
            <No>NAHHHH</No>
          </BadSnack>
        ) : (
          <></>
        )}
      </Wrapper>
    </>
  );
}

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const BadSnack = styled.div`
  position: absolute;
  height: 650px;
  width: 1150px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: grey;
  border-radius: 20px;
  box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.6);
`;

const No = styled.h1`
  color: black;
  font-size: 5em;
`;

const Test = styled.input`
  margin: 50px 242px;
`;
export default ConfirmPaymentModal;
