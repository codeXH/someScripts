//
//  DashboardView.swift
//  ActivityPage
//
//  Created by xiaohei on 2025/2/13.
//

import SwiftUI

struct GaugeView: View {
    @State private var progress: CGFloat = 0.2 // 指针进度，0.0 ~ 1.0 之间
    let startAngle: Double = -225 // 起始角度
    let endAngle: Double = 45 // 结束角度
    let needleWidth: CGFloat = 10 // 指针宽度
    let lineWidth: CGFloat = 4
    
    var body: some View {
        VStack {
            ZStack {
                // 1. 绘制仪表盘背景
                ArcShape(startAngle: startAngle, endAngle: endAngle, lineWidth: lineWidth)
                    .stroke(style: StrokeStyle(lineWidth: lineWidth, lineCap: .round))
                    .foregroundColor(Color(hex: "FFF2C5"))
                    .drawingGroup()
                    .frame(width: 200, height: 200)
                
                // 进度圆弧（颜色：#FFA122）
                ArcShape(startAngle: startAngle, endAngle: endAngle, lineWidth: lineWidth)
                    .trim(from: 0, to: progress) // 根据进度值显示部分圆弧
                    .stroke(style: StrokeStyle(lineWidth: lineWidth, lineCap: .round))
                    .foregroundColor(Color(hex: "FFA122"))
                    .drawingGroup()
                    .frame(width: 200, height: 200)
                
                ArcShape(startAngle: startAngle, endAngle: endAngle, lineWidth: 10)
                    .trim(from: 0, to: progress) // 根据进度值显示部分圆弧
                    .stroke(style: StrokeStyle(lineWidth: 10, lineCap: .square))
                    .foregroundStyle(
                        AngularGradient(
                            gradient: Gradient(stops: [
                                .init(color: Color(hex: "000000").opacity(1.0), location: 0.0),
                                .init(color: Color(hex: "CB944A").opacity(0.0), location: 0.1),
                                .init(color: Color(hex: "CB944A").opacity(0.35), location: 0.35),
                                .init(color: Color(hex: "CB944A").opacity(0.5), location: 0.5),
                                .init(color: Color(hex: "CB944A").opacity(0.75), location: 0.75),
                                .init(color: Color(hex: "CB944A").opacity(1.0), location: 1),
                            ]),
                            center: .center, // 渐变的中心点
                            startAngle: Angle(degrees: startAngle),
                            endAngle: Angle(degrees: endAngle)
                        )
                    )
                    .drawingGroup()
                    .frame(width: 220, height: 220)
                
                // 添加指针，确保指针动画
                PointerView(progress: progress, startAngle: startAngle, endAngle: endAngle, lineWidth: lineWidth)
                    .frame(width: 220, height: 220)
            }
                
            // 底部按钮，点击增加角度
            Button(action: {
                withAnimation(.easeInOut(duration: 0.5)) {
                    progress = min(progress + 0.1, 1.0)
                }
            }) {
                Text("Increase Angle")
                    .padding()
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(10)
            }
            .padding()
        }
    }
}


// 仪表盘背景弧形
struct ArcShape: Shape {
    var startAngle: Double
    var endAngle: Double
    var lineWidth: Double
    
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let center = CGPoint(x: rect.midX, y: rect.midY)
        let radius = (min(rect.width, rect.height) / 2) - (lineWidth / 2)
        path.addArc(center: center, radius: radius, startAngle: .degrees(startAngle), endAngle: .degrees(endAngle), clockwise: false)
        return path
    }
}

// 单独的指针视图
struct PointerView: View {
    let progress: CGFloat
    let startAngle: Double
    let endAngle: Double
    let lineWidth: CGFloat
    
    var body: some View {
        GeometryReader { geometry in
            Path { path in
                let w = geometry.size.width
                let h = geometry.size.height
                let x = w / 2
                let y = h / 2
                let center = CGPoint(x: x, y: y)
                let radius = min(w, h) / 2 - (lineWidth / 2)
                
                // 计算指针的角度
                let growAngle = (endAngle - startAngle) * Double(progress)
                let angle = startAngle + growAngle
                let angleRadians = Angle(degrees: angle).radians
                
                // 指针起点在圆弧内侧
                let nx = (radius - 20) * cos(angleRadians)
                let ny = (radius - 20) * sin(angleRadians)
                let startPoint = CGPoint(
                    x: center.x + nx,
                    y: center.y + ny
                )
                
                // 指针终点在圆弧外侧
                let wx = (radius + 5) * cos(angleRadians)
                let wy = (radius + 5) * sin(angleRadians)
                let endPoint = CGPoint(
                    x: center.x + wx,
                    y: center.y + wy
                )
                
                // 绘制指针
                path.move(to: startPoint)
                path.addLine(to: endPoint)
            }
            .stroke(Color.red, lineWidth: 2)
            .animation(.easeInOut(duration: 0.5), value: progress)
        }
    }
}


#Preview {
    GaugeView()
}
