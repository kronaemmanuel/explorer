import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import {
  Flex,
  Container,
  Box,
  Text
} from 'ooni-components'
import moment from 'moment'

const SummaryContainer = styled.div`
  background-color: ${props => props.color};
  color: white;
`

const StyledSummaryItemLabel = styled(Text)`
  font-weight: 600;
`

const SummaryItemBox = ({
  label,
  content
}) => (
  <Box width={1/2} mx={4} my={2}>
    <Text fontSize={24}>
      {content}
    </Text>
    <StyledSummaryItemLabel fontSize={16} >
      {label}
    </StyledSummaryItemLabel>
  </Box>
)

SummaryItemBox.propTypes = {
  label: PropTypes.string,
  content: PropTypes.node
}

const CommonSummary = ({
  measurement,
  country
}) => {
  const startTime = measurement.test_start_time
  const network = measurement.probe_asn

  return (
    <React.Fragment>
      <SummaryContainer color='#feab1e'>
        <Container>
          <Flex>
            <SummaryItemBox
              label='Network Name'
              content='AT&T Lorem Ipsum Name A.T.T Internationale'
            />
            <SummaryItemBox
              label='ASN'
              content={network}
            />
          </Flex>
          <Flex>
            <SummaryItemBox
              label='Country'
              content={country}
            />
            <SummaryItemBox
              label='Date and Time'
              content={moment(startTime).format('lll')}
            />
          </Flex>
        </Container>
      </SummaryContainer>
    </React.Fragment>
  )
}

CommonSummary.propTypes = {
  measurement: PropTypes.object.isRequired,
  country: PropTypes.string
}

export default CommonSummary
