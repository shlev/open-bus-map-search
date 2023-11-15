import { useCallback, useEffect } from 'react'
import 'antd/dist/antd.min.css'
import './App.scss'
import { ConfigProvider, Layout } from 'antd'
import 'leaflet/dist/leaflet.css'
import styled from 'styled-components'
import heIL from 'antd/es/locale/he_IL'
import { BrowserRouter as Router, useSearchParams } from 'react-router-dom'
import { PageSearchState, SearchContext } from './model/pageState'
import moment from 'moment'
import { useSessionStorage } from 'usehooks-ts'
import SideBar from './pages/components/header/sidebar/SideBar'
import { useLocation } from 'react-router-dom'
import ReactGA from 'react-ga4'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import rtlPlugin from 'stylis-plugin-rtl'
import 'moment/locale/he'
import { heIL as heILmui } from '@mui/x-date-pickers/locales'
import { ThemeProvider, createTheme } from '@mui/material'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { LocalizationProvider } from '@mui/x-date-pickers'

import RoutesList from './routes'
import {
  BarChartOutlined, BellOutlined, BugOutlined, DollarOutlined,
  FieldTimeOutlined,
  HeatMapOutlined,
  LaptopOutlined,
  LineChartOutlined, RadarChartOutlined
} from "@ant-design/icons";
import DashboardPage from "src/pages/dashboard/DashboardPage";
import TimelinePage from "src/pages/TimelinePage";
import GapsPage from "src/pages/GapsPage";
import GapsPatternsPage from "src/pages/gapsPatterns";
import RealtimeMapPage from "src/pages/RealtimeMapPage";
import SingleLineMapPage from "src/pages/SingleLineMapPage";
import About from "src/pages/About";
import {useTranslation} from "react-i18next";
import MainHeader from './pages/components/header/Header'
import LayoutContext from './layout/LayoutContext'
import { EasterEgg } from './pages/EasterEgg/EasterEgg'
const { Content } = Layout

const StyledLayout = styled(Layout)`
  height: 100vh;
`
const StyledContent = styled(Content)`
  margin: 24px 16px 0;
  overflow: auto;
`

const StyledBody = styled.div`
  padding: 24px;
  min-height: 360px;
`

const theme = createTheme(
  {
    direction: 'rtl',
    palette: {
      primary: {
        main: '#5f5bff',
      },
    },
  },
  heILmui,
)

// Create rtl cache
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [rtlPlugin],
})

const App = () => {
  const location = useLocation()

  const [searchParams, setSearchParams] = useSearchParams()
  const operatorId = searchParams.get('operatorId')
  const lineNumber = searchParams.get('lineNumber')
  const routeKey = searchParams.get('routeKey')
  const timestamp = searchParams.get('timestamp')

  const { t } = useTranslation()


  useEffect(() => {
    ReactGA.send({ hitType: 'pageview', page: location.pathname + location.search })
  }, [location])

  const [search, setSearch] = useSessionStorage<PageSearchState>('search', {
    timestamp: +timestamp! || moment().valueOf(),
    operatorId: operatorId || '',
    lineNumber: lineNumber || '',
    routeKey: routeKey || '',
  })

  const PAGES = [
    {
      label: t('dashboard_page_title'),
      path: '/dashboard',
      icon: LaptopOutlined,
      element: <DashboardPage />,
    },
    {
      label: t('timeline_page_title'),
      path: '/timeline',
      searchParamsRequired: true,
      icon: FieldTimeOutlined,
      element: <TimelinePage />,
    },
    {
      label: t('gaps_page_title'),
      path: '/gaps',
      searchParamsRequired: true,
      icon: BarChartOutlined,
      element: <GapsPage />,
    },
    {
      label: t('gaps_patterns_page_title'),
      path: '/gaps_patterns',
      icon: LineChartOutlined,
      element: <GapsPatternsPage />,
    },
    {
      label: t('realtime_map_page_title'),
      path: '/map',
      icon: HeatMapOutlined,
      element: <RealtimeMapPage />,
    },
    {
      label: t('singleline_map_page_title'),
      path: '/single-line-map',
      searchParamsRequired: true,
      icon: RadarChartOutlined,
      element: <SingleLineMapPage />,
    },
    {
      label: t('about_title'),
      path: '/about',
      icon: BellOutlined,
      element: <About />,
    },
    {
      label: t('report_a_bug_title'),
      path: 'https://github.com/hasadna/open-bus-map-search/issues',
      icon: BugOutlined,
      element: null,
    },
    {
      label: t('donate_title'),
      path: 'https://www.jgive.com/new/he/ils/donation-targets/3268#donation-modal',
      icon: DollarOutlined,
      element: null,
    },
  ]

  useEffect(() => {
    const page = PAGES.find((page) => page.path === location.pathname)
    if (page?.searchParamsRequired) {
      const params = new URLSearchParams({ timestamp: search.timestamp.toString() })

      if (search.operatorId) {
        params.set('operatorId', search.operatorId)
      }
      if (search.lineNumber) {
        params.set('lineNumber', search.lineNumber)
      }
      if (search.routeKey) {
        params.set('routeKey', search.routeKey)
      }
      setSearchParams(params)
    }
  }, [search.lineNumber, search.operatorId, search.routeKey, search.timestamp, location.pathname])

  const safeSetSearch = useCallback((mutate: (prevState: PageSearchState) => PageSearchState) => {
    setSearch((current: PageSearchState) => {
      const newSearch = mutate(current)
      return newSearch
    })
  }, [])

  return (
    <SearchContext.Provider value={{ search, setSearch: safeSetSearch }}>
      <CacheProvider value={cacheRtl}>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="he">
            <ConfigProvider direction="rtl" locale={heIL}>
              <StyledLayout className="main">
                <LayoutContext>
                  <SideBar />
                  <Layout>
                    <MainHeader />
                    <StyledContent>
                      <StyledBody>
                        <RoutesList />
                      </StyledBody>
                    </StyledContent>
                  </Layout>
                </LayoutContext>
              </StyledLayout>
            </ConfigProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </CacheProvider>
    </SearchContext.Provider>
  )
}

const RoutedApp = () => (
  <Router>
    <App />
    <EasterEgg />
  </Router>
)
export default RoutedApp
