import React, { useState, useCallback, useEffect } from 'react'
import classNames from 'classnames'
import { Col, Icon } from 'antd'
import { Chart, Geom, Axis, Tooltip, Legend } from 'bizcharts'
import { isArray } from 'util'
import { DataSet } from '@antv/data-set'

import styles from '@styles/sass/page/home.module.scss'

import { getPerformanceInfo } from '@scripts/servers'
import { generateNumList } from '@scripts/utils'
import { STYLE_TEXT_ROW } from '@scripts/constant'

import { SalesTrend } from '@components/graph'
import {
  CardItemContainer,
  BegetReactPlaceholder,
  CoverWaitContent,
  CardHeadTitle
} from '@components/common'
import { useFetchStage } from '@components/hooks'

const { stats_head } = styles

const ds = new DataSet()
const cols = {
  month: {
    range: [0, 1]
  },
  city: {
    formatter: val => (val === 'amount' ? '订单金额' : '订单利润')
  }
}

const skeletonLength = generateNumList(6)
const SkeletonRankAnalyze = () => {
  return (
    <>
      <BegetReactPlaceholder
        type="textRow"
        style={{
          height: 18,
          width: 160,
          margin: 'auto'
        }}
      />
      {skeletonLength.map(num => (
        <BegetReactPlaceholder
          key={num}
          type="textRow"
          style={STYLE_TEXT_ROW}
        />
      ))}
      <div
        style={{
          height: 2
        }}
      />
    </>
  )
  /* return (
    <BegetContentLoader height={159}>
      <rect x="165" y="10" height="10" width="70"></rect>
      {skeletonLength.map(num => (
        <rect
          key={num}
          x="8.5"
          y={30 + num * 26}
          height="18"
          width="383"
        ></rect>
      ))}
    </BegetContentLoader>
  ); */
}

export default function RankAnalyze() {
  const { loading, hideLoading } = useFetchStage()
  const [activeIndex, setActiveIndex] = useState(0)
  const [data, setData] = useState([])
  const fetchData = useCallback(() => {
    getPerformanceInfo(activeIndex).then(res => {
      if (isArray(res)) {
        setData(res as [])
        hideLoading()
      }
    })
  }, [activeIndex])
  useEffect(() => {
    fetchData()
  }, [activeIndex, fetchData])
  const dv = ds.createView().source(data)
  dv.transform({
    type: 'fold',
    fields: ['amount', 'profit'],
    key: 'city',
    value: 'temperature'
  })
  return (
    <>
      <Col sm={24} xl={12} xxl={18}>
        <CardItemContainer>
          <CoverWaitContent
            loading={loading}
            loadingPlaceholder={<SkeletonRankAnalyze />}
          >
            <h3 className={stats_head} layout-align="space-between center">
              <span className="title" style={{ color: '#1890ff' }}>
                <Icon className="font-size-md" type="line-chart" />
                业绩分析
              </span>
              <div>
                {['月', '年'].map((item, key) => {
                  return (
                    <span
                      key={item}
                      className={classNames('cycle', {
                        selected: Object.is(activeIndex, key),
                        mgr: Object.is(0, key)
                      })}
                      onClick={() => setActiveIndex(key)}
                    >
                      {item}
                    </span>
                  )
                })}
              </div>
            </h3>
            <Chart
              padding="auto"
              height={372.82}
              data={dv}
              scale={cols}
              forceFit
            >
              <Legend position="top" offsetY={-30} />
              <Axis name="month" />
              <Axis name="temperature" />
              <Tooltip
                crosshairs={{
                  type: 'y'
                }}
              />
              <Geom
                type="line"
                position="month*temperature"
                size={2}
                color={'city'}
                shape={'smooth'}
              />
              <Geom
                type="point"
                position="month*temperature"
                size={4}
                shape={'circle'}
                color={'city'}
                style={{
                  stroke: '#fff',
                  lineWidth: 1
                }}
              />
            </Chart>
          </CoverWaitContent>
        </CardItemContainer>
      </Col>
      <Col sm={24} xl={12} xxl={6}>
        <CardItemContainer>
          <SalesTrend
            title={
              <CardHeadTitle
                text="销售额占比"
                icon="pie-chart"
                color="#ff5a57"
              />
            }
          />
        </CardItemContainer>
      </Col>
    </>
  )
}
