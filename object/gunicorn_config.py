import multiprocessing as mp

bind = "0.0.0.0:5000"
workers = mp.cpu_count() * 2 + 1
