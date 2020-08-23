/* global process */
import React, { useState }from 'react'
import axios from 'axios'
import {
  Container,
  Heading,
  Text, Hero,
  Flex, Box
} from 'ooni-components'
import countryUtil from 'country-util'
import styled from 'styled-components'
import { StickyContainer, Sticky } from 'react-sticky'

import NavBar from '../components/NavBar'
import Flag from '../components/Flag'
import Layout from '../components/Layout'
import PageNavMenu from '../components/country/PageNavMenu'
import Overview from '../components/country/Overview'
import WebsitesSection from '../components/country/Websites'
import AppsSection from '../components/country/Apps'
import NetworkPropertiesSection from '../components/country/NetworkProperties'
import { CountryContextProvider } from '../components/country/CountryContext'
import IntlHead from '../components/country/IntlHead'
import { ScreenshotProvider } from '../components/ScreenshotContext'
import TestsByGroup from '../components/country/OverviewCharts'

const getCountryReports = (countryCode, data) => {
  const reports = data.filter((article) => (
    article.tags && article.tags.indexOf(`country-${countryCode.toLowerCase()}`) > -1
  )).map((article) => (
    article
  ))
  return reports
}
const RaisedHeader = styled.div`
  border-bottom: 1px solid ${props => props.theme.colors.gray3};
  background-color: white;
  z-index: 100;
`

const AnimatedFlex = styled(Flex)`
  transition: all 0.5s ease;
`

const AnimatedHeading = styled(Heading)`
  transition: all 0.5s ease;
`

Country.getInitialProps = async ({ req, res, query }) => {
  const { countryCode } = query
  if (res && (countryCode !== countryCode.toUpperCase())) {
    res.writeHead(301, {
      Location: `/country/${countryCode.toUpperCase()}`
    })

    res.end()
    return {}
  }

  let client = axios.create({baseURL: process.env.MEASUREMENTS_URL}) // eslint-disable-line
  let results = await Promise.all([
    // XXX cc @darkk we should ideally have better dedicated daily dumps for this view
    client.get('/api/_/test_coverage', {params: {'probe_cc': countryCode}}),
    client.get('/api/_/country_overview', { params: {'probe_cc': countryCode}}),
    client.get('https://ooni.org/pageindex.json')
  ])

  const testCoverage = results[0].data.test_coverage
  const networkCoverage = results[0].data.network_coverage
  const overviewStats = results[1].data
  const reports = getCountryReports(countryCode, results[2].data)
  const screenshot = query.screenshot ? true : false

  return {
    testCoverage,
    networkCoverage,
    overviewStats,
    reports,
    countryCode,
    countryName: countryUtil.territoryNames[countryCode],
    screenshot
  }
}

export default function Country(props){
  const [newData, setNewData] = useState(false)

  const fetchTestCoverageData = async (testGroupList) => {
    let client = axios.create({baseURL: process.env.MEASUREMENTS_URL}) // eslint-disable-line
    const result = await client.get('/api/_/test_coverage', {
      params: {
        'probe_cc': this.props.countryCode,
        'test_groups': testGroupList
      }
    })
    // TODO: Use React.createContext to pass along data and methods
    setNewData({
      networkCoverage: result.data.network_coverage,
      testCoverage: result.data.test_coverage
    })
  }

  const {
    countryCode,
    countryName,
    overviewStats,
    reports,
    screenshot
  } = props

  const { testCoverage, networkCoverage } = newData ? newData : props

  if (screenshot) {
    return(
      <ScreenshotProvider screenshot={screenshot}>
        <Layout>
          <NavBar />
          <TestsByGroup
            fetchTestCoverageData={fetchTestCoverageData}
            testCoverage={testCoverage}
            networkCoverage={networkCoverage}
          />
        </Layout>
      </ScreenshotProvider>
    )
  } else {
    return (
      <Layout>
        <IntlHead
          countryCode={countryCode}
          countryName={countryName}
          measurementCount={overviewStats.measurement_count}
          measuredSince={overviewStats.first_bucket_date}
          networkCount={overviewStats.network_count}
        />
        <StickyContainer>
          <Sticky>
            {({ style, distanceFromTop }) => {
              let miniHeader = false
              if (distanceFromTop < -150) {
                miniHeader = true
              }
              return (
                <RaisedHeader style={style}>
                  <NavBar />
                  <Container>
                    <AnimatedFlex alignItems='center' py={ miniHeader ? 0 : 4} flexWrap='wrap'>
                      <Box>
                        <Flag countryCode={countryCode} size={miniHeader ? 32: 60} />
                      </Box>
                      <Box ml={3} mr='auto'>
                        <AnimatedHeading fontSize={miniHeader ? 2 : 4}>
                          {countryName}
                        </AnimatedHeading>
                      </Box>
                      <PageNavMenu />
                    </AnimatedFlex>
                  </Container>
                </RaisedHeader>
              )
            }}
          </Sticky>
          <Container>
            <Flex flexWrap='wrap' mt={4}>
              <Box>
                <CountryContextProvider countryCode={countryCode} countryName={countryName}>
                  <Overview
                    countryName={countryName}
                    middleboxCount={overviewStats.middlebox_detected_networks}
                    imCount={overviewStats.im_apps_blocked}
                    circumventionTools={overviewStats.circumvention_tools_blocked}
                    blockedWebsitesCount={overviewStats.websites_confirmed_blocked}
                    networkCount={overviewStats.network_count}
                    measurementCount={overviewStats.measurement_count}
                    measuredSince={overviewStats.first_bucket_date}
                    testCoverage={testCoverage}
                    networkCoverage={networkCoverage}
                    fetchTestCoverageData={fetchTestCoverageData}
                    featuredArticles={reports}
                  />
                  <WebsitesSection />
                  <AppsSection />
                  <NetworkPropertiesSection countryCode={countryCode} />
                </CountryContextProvider>
              </Box>
            </Flex>
          </Container>
        </StickyContainer>
      </Layout>
    )
  }
}
