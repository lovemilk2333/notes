import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(-10, 10, 800)
y = eval(input('your expression: '))

label = input('your expression\'s label: ').strip()

fig, ax = plt.subplots()
ax.plot(x, y, label=label)
ax.plot(0, 0, 'ro')
ax.grid(True)
ax.set_xlabel("X")
ax.set_ylabel("Y")
ax.legend()

fig.savefig(f"../contents/public/math-svg/{label}.svg", format="svg")
