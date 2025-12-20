"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardBody, CardHeader } from "@heroui/card"
import { Button } from "@heroui/button"
import { Select, SelectItem } from "@heroui/select"
import type { SumData, OverviewData } from "~/types/api/admin"
import { ADMIN_STATS_MAP, ADMIN_STATS_SUM_MAP } from "~/constants/admin"

export default function AdminHome() {
  const [sumData, setSumData] = useState<SumData | null>(null)
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null)
  const [days, setDays] = useState("7")
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const [sumRes, overviewRes] = await Promise.all([
        fetch("/api/admin/stats/sum"),
        fetch(`/api/admin/stats?days=${days}`)
      ])

      if (sumRes.ok) {
        const sum = await sumRes.json()
        setSumData(sum)
      }

      if (overviewRes.ok) {
        const overview = await overviewRes.json()
        setOverviewData(overview)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [days])

  const navigationItems = [
    { href: "/admin/resource", title: "资源与举报管理", desc: "查看所有资源、处理用户举报" },
    { href: "/admin/course", title: "课程信息维护", desc: "编辑课程名称、简介、封面、标签" },
    { href: "/admin/department", title: "学院管理", desc: "创建/编辑/删除学院信息" }
  ]

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">管理面板</h1>
        {mounted && (
          <Select
            label="时间范围"
            size="sm"
            className="w-32"
            selectedKeys={[days]}
            onChange={(e) => setDays(e.target.value)}
          >
            <SelectItem key="7" value="7">最近7天</SelectItem>
            <SelectItem key="30" value="30">最近30天</SelectItem>
            <SelectItem key="60" value="60">最近60天</SelectItem>
          </Select>
        )}
      </div>

      {/* 总计统计 */}
      <section>
        <h2 className="text-lg font-medium mb-3">平台总览</h2>
        {loading && !sumData ? (
          <div className="text-default-500">加载中...</div>
        ) : sumData ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard
              title={ADMIN_STATS_SUM_MAP.userCount}
              value={sumData.userCount ?? 0}
              color="primary"
            />
            <StatCard
              title={ADMIN_STATS_SUM_MAP.courseCount}
              value={sumData.courseCount ?? 0}
              color="secondary"
            />
            <StatCard
              title={ADMIN_STATS_SUM_MAP.resourceCount}
              value={sumData.resourceCount ?? 0}
              color="success"
            />
            <StatCard
              title={ADMIN_STATS_SUM_MAP.commentCount}
              value={sumData.commentCount ?? 0}
              color="warning"
            />
            <StatCard
              title={ADMIN_STATS_SUM_MAP.departmentCount}
              value={sumData.departmentCount ?? 0}
              color="danger"
            />
          </div>
        ) : (
          <div className="text-default-500">暂无数据</div>
        )}
      </section>

      {/* 新增统计 */}
      <section>
        <h2 className="text-lg font-medium mb-3">新增数据（最近 {days} 天）</h2>
        {loading && !overviewData ? (
          <div className="text-default-500">加载中...</div>
        ) : overviewData ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard
              title={ADMIN_STATS_MAP.newUser}
              value={overviewData.newUser ?? 0}
              color="default"
              variant="flat"
            />
            <StatCard
              title={ADMIN_STATS_MAP.newActiveUser}
              value={overviewData.newActiveUser ?? 0}
              color="default"
              variant="flat"
            />
            <StatCard
              title={ADMIN_STATS_MAP.newCourse}
              value={overviewData.newCourse ?? 0}
              color="default"
              variant="flat"
            />
            <StatCard
              title={ADMIN_STATS_MAP.newResource}
              value={overviewData.newResource ?? 0}
              color="default"
              variant="flat"
            />
            <StatCard
              title={ADMIN_STATS_MAP.newComment}
              value={overviewData.newComment ?? 0}
              color="default"
              variant="flat"
            />
          </div>
        ) : (
          <div className="text-default-500">暂无数据</div>
        )}
      </section>

      {/* 功能导航 */}
      <section>
        <h2 className="text-lg font-medium mb-3">管理功能</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {navigationItems.map((item) => (
            <Card key={item.href} isPressable as={Link} href={item.href}>
              <CardBody className="p-5 space-y-1">
                <div className="text-lg font-medium">{item.title}</div>
                <div className="text-default-500 text-sm">{item.desc}</div>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger"
  variant?: "solid" | "flat" | "bordered" | "shadow"
}

function StatCard({ title, value, color = "primary", variant = "shadow" }: StatCardProps) {
  const colorClasses = {
    default: "text-default-700",
    primary: "text-primary",
    secondary: "text-secondary",
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger"
  }

  return (
    <Card className={`border-none ${variant === "shadow" ? "shadow-md" : ""}`}>
      <CardBody className="p-4">
        <div className="text-sm text-default-500 mb-1">{title}</div>
        <div className={`text-3xl font-bold ${colorClasses[color]}`}>
          {(value ?? 0).toLocaleString()}
        </div>
      </CardBody>
    </Card>
  )
}
