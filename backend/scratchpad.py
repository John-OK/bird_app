coords = [0,0]

def test():
    coords[0] = 5
    coords[1] = 65
    print(coords)

test()
print(f"outside function: {coords}")
