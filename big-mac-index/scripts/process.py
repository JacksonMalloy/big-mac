#!/usr/bin/python
# -*- coding: utf8 -*-

import os
import urllib
import datetime
import csv
import xlrd


source = 'http://infographics.economist.com/2016/databank/BMfile2000toJan2016.xls'

def get_date(date_to_convert):
	'''returns the date in folowing format: yyyy/mm/dd
	
	'''
	for index in range(len(date_to_convert)):
		try:
			int(date_to_convert[index])
			result_year = date_to_convert[index:]
			break
		except:
			result_month = date_to_convert[:index + 1]
	result_date = datetime.datetime.strptime(result_year + '-' + result_month, '%Y-%b').date()
	return result_date

def setup():
	'''Crates the directorie for archive if they don't exist
	
	'''
	if not os.path.exists('archive'):
		os.mkdir('archive')

def retrieve(source):
	'''Downloades xls data to archive directory
	
	'''
	urllib.urlretrieve(source,'archive/external-data.xls')

def get_data():
	'''Gets the data from xls file and returns a ictionery of countries lists of it's data by year
	
	'''
	countries = {}
	
	with xlrd.open_workbook('archive/external-data.xls') as xls_data:
		sheets= xls_data.sheets()
		for sheet in reversed(sheets):
			row_num = sheet.nrows
			for row in range(1, row_num):
				bmi_date = get_date(sheet.name)
				values = [bmi_date]
				for col in range(6):
					if col < 1:
						if sheet.cell_value(row, col) not in countries:
							countries[sheet.cell_value(row, col)] = []
					else:
						# N/A CELLS IN ORIGINAL FILE IS TRANSFERED AS INTEGER 42 FROM XLS FILE
						if not isinstance(sheet.cell_value(row, col), int):
							values.append(sheet.cell_value(row, col))				
				countries[sheet.cell_value(row, 0)].append(values)
		return countries
			
def process(data):
	'''takes dictionery of data as input and writes data into csv file
	
	'''
	header = ['Country',
			  'Date',
			  'Local price',
			  'Dollar ex',
			  'Dollar price',
			  'Dollar PPP',
			  'Dollar valuation']

	with open('data/big-mac-index.csv', 'w') as csv_file:
		csv_writer = csv.writer(csv_file)
		csv_writer.writerow(header)
		for country in sorted(data.keys()):
			for row_data in data[country]:
				if len(row_data) > 2:
					row = [country] + row_data
					csv_writer.writerow(row)
			
if __name__ == '__main__':
	setup()
	retrieve(source)
	data = get_data()
	process(data)
	