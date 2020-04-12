import React from 'react';
import styled from 'styled-components';
import NavBar from '../NavBar'
// import ListingGrid from '../ListingGrid/ListingGrid';
// import Paragraph from './Paragraph';

// import { items } from '../data/data';

import DropDown from "../DropDown/DropDown";

function Home() {
  return (
    <>
    <NavBar/>
      <Intro>
        <p>
          Weary Sweaty sells the finest wearable equipment to help you stay
          healthy.
        </p>
        <DropDown />
      </Intro>
      {/* <ListingGrid itemList={Object.values(items)} /> */}
    </>
  );
}

const Intro = styled.div`
  padding-bottom: 24px;
`;

export default Home;
