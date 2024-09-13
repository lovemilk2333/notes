> 本文档由 py-turtle.doc 转换而成

**导入：**

import turtle :导入

pip install turtle :安装

**画笔外观：**

turtle.showturtle() 显示画笔形状

turtle.hideturtle() 隐藏画笔的形状

turtle.pensize() 设置画笔的宽度

turtle.speed() 设置画笔的速度


**填充：**

turtle.fillcolor() 绘制图形的填充颜色

turtle.begin\_fill() 准备开始填充图形

turtle.end\_fill() 填充完成

turtle.filling() 查询程序中任何位置的填充状态

此函数用于返回填充状（填充时为True，否则false）

**画布设置：**

**画布：**

画布就是turtle为我们展开用于绘图区域, 我们可以设置它的大小和初始位置


**设置画布大小**

**像素法**：

turtle.screensize(canvwidth=none,canvheight=none, bg=none)

参数分别为画布的宽（单位像素），高，背景颜色

（turtle.screensize(800,600,”green”)  画布的宽，高，画布颜色）

turtle.screensize() 返回默认大小（400,300）

**比率法：**

turtle.setup(width=0.5,height=0.75,startx=None,starty=None)

参数width,height：输入宽和高为整数时，表示像素；为小数时，表示占据电脑屏幕的比例，(startx,starty)这一坐标表示矩形窗口左上角顶点的位置，如果为None，则窗口位于屏幕中心

**画笔属性：**

turtle.pensize() 设置画笔的宽度

turtle.color(color1,color2) ：

同时设置 (“画笔颜色”，“填充颜色”）

pencolor = color1,fillcolor=color2

turtle.pencolor() 传入参数可设置画笔的颜色，可以是字符串”green”,”red”,也可以RGB 3元组，不传入参数则返回当前画笔的颜色

turtle.speed() 设置画笔的移动速度，画笔绘制的速度范围[0,10]的整数，数字越大越快

turtle.hideturtle() 隐藏画笔的形状

turtle.showturtle() 显示画笔形状



**画笔移动命令：**

turtle.position() 

用来获取当前箭头的位置，一开始用\n调用这个函数会初始化一个tk，初始的坐标值，如(0.00,0.00)


turtle.forward(n)或turtle.fd(n) 向当前画笔方向移动n像素长

turtle.backward(n)或turtle.bk(n) 向当前画笔相反方向移动n像素长度

turtle.setpos(x,y)或turtle.goto(x,y)或turtle.srtposition(x,y)直接去到某一个坐标（位置）

turtle.setx(x)设置x坐标，turtle.sety(y)设置y坐标

turtle.home()返回原点，并且箭头方向为0度




**画笔运动角度：**

（angle表示绝对角度）

turtle.setheading(angle)或turtle.seth(angle) 设置朝向角度angle

turtle.seth(angle) 只改变海龟的行进方向(角度按逆时针)，但不行进，angle为绝对度数


turtle.heading()获取当前箭头的角度，一开始为0度


turtle.right(angle)或者turtle.rt(angle)箭头方向向右旋转x度

turtle.left(angle)或者turtle.lt(angle)箭头方向向左旋转x度







**画笔运动形状**

turtle.circle(半径)画圆：

半径为正数，表示圆心在海龟的左侧画圆

半径为负数，表示圆心在海归的右侧画圆

（顺着前进方向画圆）

turtle.circle(radius半径，extent角度)

当extent = None 表示画完整的圆

`   `turtle.circle(100,90)#绘制一个半径为100，角度为90度的圆弧

`	`turtle.circle(90,180)#绘制一个半径为90，角度为180度的圆弧

dot(r)绘制一个指定半径和颜色的圆点

turtle.penup()  提笔，移动时不绘制图形，用于换个地方绘制时使用

turtle.pendown()  落笔，移动时绘制图形，缺省时也会绘制


**文字填充：**

**turtle.write(“内容”,align =”center”,font= (“宋 , 8,”normal”))**

内容 ——书写的文字，格式必须是字符串

align ——对齐方式，字符串” left ” ,” center ” 或 ” right ” 之一

font ——字体，三元组（字体名称，字体大小，字体类型（默认常规字体））


turtle.done()  画完后不关闭窗口，但是后面的程序无法执行，关闭窗口后才会执行









\37. 

` 	`绘制如下图形：  

` 	`&nbsp;![20200312122125\_3989.png](/py-turtle.001.png "20200312122125\_3989")   



` 		`1.画一个由两个直角三角形组成的正方形，边长为180像素； 	 	

` 		`2.左上三角形填充为黄色，右下三角形填充为红色；如上图： 	  

` 	`3.设置画笔速度为1，线条为黑色；&nbsp;  

` 	`4.画图结束，隐藏并停止画笔。 



` 	`import turtle &nbsp;#库准备  

` 	`turtle.fillcolor('red') #设置填充颜色为红色  

` 	`turtle.speed(1) #设置画笔移动速度为1  

` 	`turtle.begin\_fill() #开始填充  

` 	`turtle.forward(180) #从当前方向移动180  

` 	`turtle.left(90) #逆时针方向旋转90°  

` 	`turtle.forward(180) #从当前方向移动180  

` 	`turtle.goto(0,0) #移动到（0，0）的位置，即起始位置  

` 	`turtle.end\_fill() #填充结束  

` 	`turtle.fillcolor('yellow') #设置填充颜色为黄色  

` 	`turtle.begin\_fill() #开始填充  

` 	`turtle.forward(180) #从当前方向移动180  

` 	`turtle.right(90) #顺时针方向旋转90°  

` 	`turtle.forward(180) #从当前方向移动180  

` 	`turtle.end\_fill() #填充结束  

` 	`turtle.hideturtle() #隐藏画笔  

` 	`turtle.done() #停止画笔等待关闭  













画出下面示意图形，要求如下：  

` 	`（1）画出如下的图形，注：直线部分是由两个步长为200的线段垂直相交组成，圆的直径为200；

（2）图形的中心位置为画布中心；

（3）画笔宽度为2，颜色为红色。  

` 	`![20200413164945\_8634.png](/py-turtle.002.png "20200413164945\_8634")  

import turtle

turtle.pencolor("red")

turtle.pensize(2)

turtle.forward(-100)

turtle.forward(200)

turtle.left(90)

turtle.circle(100,450)

turtle.left(90)

turtle.forward(200)

turtle.done()



















`	`绘制如下图形：  

` 	`![20210128134721\_8372.png](/py-turtle.003.png "20210128134721\_8372")   

` 	`（1）画一个由一个正方形和一个菱形组成的图形，其中，正方形的边长为200象素，菱形的四个顶点均在正方形四条边的中点上；

（2）设置画笔速度为1；

（3）菱形的填充颜色为红色，所有线条为黑色；

（4）画图结束，隐藏并停止画笔。  



import turtle&nbsp;&nbsp;

turtle.fillcolor("red") #设置填充颜色为红色

turtle.speed(1)#设置画笔移动速度为1

turtle.forward(200)&nbsp; #从当前方向移动200

turtle.left(90)#逆时针方向旋转90度

turtle.forward(200)

turtle.left(90)

turtle.forward(200)

turtle.left(90)

turtle.forward(200)

turtle.up()#抬起画笔

turtle.goto(100,0)#移动到（100，0）的位置，即菱形的第一个顶点位置

turtle.down()#放下画笔

turtle.begin\_fill()#开始填充

turtle.goto(200,100)#移动到（200，100）的位置，即菱形的第二个顶点位置

turtle.goto(100,200)#移动到（100，200）的位置，即菱形的第三个顶点位置

turtle.goto(0,100)#移动到（0，100）的位置，即菱形的第四个顶点位置

turtle.goto(100,0)#移动到（100，0）的位置，即菱形的第一个顶点位置

turtle.end\_fill()#填充结束

turtle.hideturtle()#隐藏画笔

turtle.done()#停止画笔等待关闭

