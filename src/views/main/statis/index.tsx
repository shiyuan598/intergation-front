import React, { useState, useEffect } from 'react';
import { Select, DatePicker } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import style from './statis.module.scss';
import { statis as statisApi, vehicle as vehicleApi } from "../../../api";
import type { Moment } from 'moment';
import moment from 'moment';
import { number } from 'echarts';
import { stringify } from 'querystring';
import { getTrailingCommentRanges } from 'typescript';
const { RangePicker } = DatePicker;

export default function App() {
    const [vehicleIds, setVehicleIds] = useState<any>(["35"]); // 车辆编号
    const [timeScale, setTimeScale] = useState<any>("date"); // 时间尺度
    const [timeSpan, setTimeSpan] = useState<any>(["", ""]); // 时间尺度

    const vehicleChange = (value: string) => {
        setVehicleIds(value);
    };
    const timeScaleChange = (value: string) => {
        setTimeScale(value);
    };

    const removeTag = (e: any, value: string) => {
        e.stopPropagation();
        setVehicleIds(vehicleIds.slice(1, vehicleIds.length));
    };

    const tagRender = (props: any) => {
        let {value, label} = props;
        let index = vehicleIds.indexOf(value);
        if (index === 0) {
            return <span className='ant-select-selection-item'>
                <span className='ant-select-selection-item-content'>{label}</span>
                <span className='ant-select-selection-item-remove' onClick={(e) => { removeTag(e, value) }}><CloseOutlined /></span>
            </span>;
        } else if (index === 1) {
            return <span className='ant-select-selection-item'>{`+ ${vehicleIds.length - 1}`}</span>;
        } else {
            return <></>;
        }
    };

    const timeSpanChange = (dates: any, dateString: [string, string]) => {
        let formatter = "YYYY-MM-DD";
        let startDate = dates[0];
        let endDate = dates[1];

        let selectedDate = ["", ""];
        switch (timeScale) {
            case "date":
                // 日期类型直接转换start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD')
                selectedDate = [startDate.format(formatter), endDate.format(formatter)];
                break;
            case "week":
                // 周转换为日期 -- 先判断周几，start往前推算到周一，end往后推算到周日
                let startWeekday = startDate.format("E"); // 周几
                let endWeekday = endDate.format("E");
                // 推算到周一
                let newStart = (startDate.add(1 - startWeekday, 'days')).format(formatter);
                // 推算到周日
                let newEnd = (endDate.add(7 - endWeekday, 'days')).format(formatter);
                selectedDate = [newStart, newEnd];
                break;
            case "month":
                // 月份start.format('YYYY-MM') + '-01', end.format('YYYY-MM') + '-' + end.daysInMonth() // 该月的天数
                selectedDate = [startDate.format("YYYY-MM") + "-01", endDate.format('YYYY-MM') + '-' + endDate.daysInMonth()];
                break;
            case "quarter":
                const startEndofQuarter = {
                    "Q1": {
                        start: "01-01",
                        end: "03-31"
                    },
                    "Q2": {
                        start: "04-01",
                        end: "06-30"
                    },
                    "Q3": {
                        start: "07-01",
                        end: "09-30"
                    },
                    "Q4": {
                        start: "10-01",
                        end: "12-31"
                    },
                };
                let startQuarter = dateString[0].slice(-2) as ("Q1" | "Q2" | "Q3" | "Q4");
                let endQuarter = dateString[1].slice(-2) as ("Q1" | "Q2" | "Q3" | "Q4");
                // 季度先定义好每一个季度的开始和结束日期
                // start.format('YYYY') + '-01-01', end.format('YYYY') + '-09-30'
                selectedDate = [startDate.format("YYYY") + "-" + startEndofQuarter[startQuarter].start, endDate.format('YYYY') + '-' + startEndofQuarter[endQuarter].end];
                break;
            case "year":
                // 年份start + '-01-01', end + '-12-31'
                selectedDate = [startDate.format("YYYY") + '-01-01', endDate.format("YYYY") + '-12-31'];
                break;
            default:
                break;
        }
        setTimeSpan(selectedDate);
    };

    const getTimeRange = (start: string, end: string, date: string) => {
        let min,max =0;
        if(moment(start).isBefore(moment(date), "day")) { // 起始时间早于选择的日期
            min = 0;
            if (moment(end).isAfter(moment(date), "day")) { // 结束时间晚于选择的日期
                max = 23
            } else {
                max = moment(end).get("hour");
            }
        } else {
            min = moment(start).get("hour");
            if (moment(end).isAfter(moment(date), "day")) {
                max = 23
            } else {
                max = moment(end).get("hour");
            }
        }
        let arr = [];
        for(let i=min; i<=max; i++) {
            arr.push(i);
        }
        console.info(`start: ${start}, end: ${end}, date: ${date}, range: ${arr}`);
        return arr;
    }

    useEffect(() => {
        console.info(vehicleIds, timeScale, timeSpan);
        if (!timeSpan.length || !timeSpan[0] || !timeSpan[1]) {
            return;
        }
        // statisApi.getTotal({
        //     vehicleIds, timeScale, timeSpan
        // }).then((v) => {
        //     console.info(v);
        // });

    }, [vehicleIds, timeScale, timeSpan]);

    return (
        <div>
            <h4>统计分析</h4>
            <p>建设中...</p>
            <div className={style.optionContainer}>
                <div className={style.option}>
                    <span className={style.label}>车辆编号:</span>
                    <Select
                        tagRender={tagRender}
                        style={{ width: "150px" }}
                        mode="multiple"
                        allowClear
                        value={vehicleIds}
                        defaultValue={"34"}
                        placeholder="请选择车辆编号"
                        onChange={vehicleChange}
                        options={[
                            { value: "34", label: "J7A11" },
                            { value: "35", label: "J7A05" },
                            { value: "38", label: "J7A03" },
                            { value: "39", label: "J7A04" }
                        ]}
                    ></Select>
                </div>
                <div className={style.option}>
                    <span className={style.label}>时间尺度:</span>
                    <Select
                        style={{ width: "120px" }}
                        defaultValue={"date"}
                        onChange={timeScaleChange}
                        placeholder="请选择时间尺度"
                        options={[
                            { value: "date", label: "按天" },
                            { value: "week", label: "按周" },
                            { value: "month", label: "按月" },
                            { value: "quarter", label: "按季" },
                            { value: "year", label: "按年" }
                        ]}
                    ></Select>
                </div>
                <div className={style.option}>
                    <span className={style.label}>时间范围:</span>
                    <RangePicker style={{ width: "240px" }} onChange={timeSpanChange} picker={timeScale} />
                </div>
            </div>
        </div>
    )
}